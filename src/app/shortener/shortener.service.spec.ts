import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { ShortenerService } from './shortener.service';
import { Links } from './schemas/Links.schema';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { NotFoundException } from '@nestjs/common';

const mockLink = {
  Original: 'https://example.com',
  shortCode: 'abc123',
  usageTimes: 0,
};

describe('ShortenerService', () => {
  let service: ShortenerService;
  let model: Model<Links>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        {
          provide: getModelToken(Links.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            updateOne: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    model = module.get<Model<Links>>(getModelToken(Links.name));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should shorten a URL and return the shortened URL', async () => {
    jest.spyOn(model, 'findOne').mockResolvedValueOnce(null); // Simulate no existing link
    jest.spyOn(model, 'create').mockResolvedValueOnce(mockLink as any);
    jest.spyOn(cacheManager, 'set').mockResolvedValueOnce(undefined);

    const result = await service.create({ original: mockLink.Original });
    expect(result).toContain('/shorten/'); // Should contain base URL
  });

  it('should return the original URL if found in Redis cache', async () => {
    jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(mockLink.Original);

    const result = await service.GetLink(mockLink.shortCode);
    expect(result).toBe(mockLink.Original); // Should return the original URL
  });

  it('should throw NotFoundException if URL not found', async () => {
    jest.spyOn(cacheManager, 'get').mockResolvedValueOnce(null); // Cache miss
    jest.spyOn(model, 'findOne').mockResolvedValueOnce(null); // Not found in DB either

    await expect(service.GetLink(mockLink.shortCode)).rejects.toThrow(NotFoundException);
  });

  it('should increment usage times for the link', async () => {
    jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockLink as any);
    jest.spyOn(model, 'updateOne').mockResolvedValueOnce({} as any);

    //@ts-ignore
    await service.incrementClickCount(mockLink.shortCode);
    expect(model.updateOne).toHaveBeenCalledWith(
      { shortCode: mockLink.shortCode },
      { $inc: { usageTimes: 1 } },
    );
  });

  it('should retrieve usage statistics for a shortened URL', async () => {
    jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockLink as any);

    const result = await service.getStatistic(mockLink.shortCode);
    expect(result).toContain('used 0 times');
  });
});
