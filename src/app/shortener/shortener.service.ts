import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Links } from './schemas/Links.schema';
import { createDto } from './dto/Create.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShortenerService {
    private readonly cacheTtl = 3600; // Cache expiration in seconds (1 hour)

    constructor(
        @InjectModel(Links.name) private readonly linkModel: Model<Links>,
        @Inject(CACHE_MANAGER) private readonly redis: Cache
    ) {}

    async create(createDto: createDto): Promise<string> {
        const existingLink = await this.linkModel.findOne({ original: createDto.original });
        
        if (existingLink) {
            await this.cacheUrl(existingLink.shortCode, existingLink.original);
            return existingLink.shortCode;
        }

        const shortCode = uuidv4().slice(0, 6);

        await this.cacheUrl(shortCode, createDto.original);

        const newLink = new this.linkModel({
            ...createDto,
            shortCode,
            usageTimes: 0,
        });

        await newLink.save();
        return shortCode;
    }

    async getLink(shortCode: string): Promise<string> {

        const cachedLink = await this.redis.get<string>(shortCode);

        if (cachedLink) {
            await this.incrementClickCount(shortCode);
            return cachedLink;
        }

        const document = await this.linkModel.findOne({ shortCode }).exec();
        if (!document) {
            throw new NotFoundException('Link not found');
        }

        await this.cacheUrl(shortCode, document.original);
        await this.incrementClickCount(shortCode);
        return document.original;
    }


    private async incrementClickCount(shortCode: string): Promise<void> {
        await this.linkModel.updateOne({ shortCode }, { $inc: { usageTimes: 1 } });
    }


    async getStatistic(shortCode: string): Promise<string> {
        const document = await this.linkModel.findOne({ shortCode });
        if (!document) {
            throw new NotFoundException('Link not found');
        }
        return `This link was used ${document.usageTimes} times.`;
    }

    private async cacheUrl(shortCode: string, url: string): Promise<void> {
        const cached = await this.redis.get(shortCode);
        if (!cached) {
            await this.redis.set(shortCode, url, this.cacheTtl);
        }
    }
}
