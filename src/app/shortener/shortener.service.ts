import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Links } from './schemas/Links.schema';
import { createDto } from './dto/Create.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShortenerService {
    private readonly baseUrl = "http://localhost:3000/shortener";
    private readonly cacheTtl = 3600; // Cache expiration in seconds (1 hour)

    constructor(
        @InjectModel(Links.name) private readonly linkModel: Model<Links>,
        @Inject(CACHE_MANAGER) private readonly redis: Cache
    ) {}

    // Create or retrieve a shortened link
    async create(createDto: createDto): Promise<string> {
        // Check if the URL already has a short code
        const existingLink = await this.linkModel.findOne({ original: createDto.original });
        
        if (existingLink) {
            await this.cacheUrl(existingLink.shortCode, existingLink.original);
            return `${this.baseUrl}/${existingLink.shortCode}`;
        }

        const shortCode = uuidv4().slice(0, 6);

        await this.cacheUrl(shortCode, createDto.original);

        // Store in MongoDB
        const newLink = new this.linkModel({
            ...createDto,
            shortCode,
            usageTimes: 0,
        });

        await newLink.save();
        return `${this.baseUrl}/${shortCode}`;
    }

    // Retrieve the original URL by short code
    async GetLink(shortCode: string): Promise<string> {
        // Check Redis cache first
        const cachedLink = await this.redis.get<string>(shortCode);

        if (cachedLink) {
            // Increment click count in MongoDB
            await this.incrementClickCount(shortCode);
            return cachedLink;
        }

        // Fallback to MongoDB if not in cache
        const document = await this.linkModel.findOne({ shortCode });
        if (!document) {
            throw new NotFoundException('Link not found');
        }

        // Cache the URL and increment click count
        await this.cacheUrl(shortCode, document.original);
        await this.incrementClickCount(shortCode);
        return document.original;
    }


    private async incrementClickCount(shortCode: string): Promise<void> {
        await this.linkModel.updateOne({ shortCode }, { $inc: { usageTimes: 1 } });
    }

    // Get usage statistics for a given short code
    async getStatistic(shortCode: string): Promise<string> {
        const document = await this.linkModel.findOne({ shortCode });
        if (!document) {
            throw new NotFoundException('Link not found');
        }
        return `This link was used ${document.usageTimes} times.`;
    }

    // Helper to cache URL in Redis
    private async cacheUrl(shortCode: string, url: string): Promise<void> {
        const cached = await this.redis.get(shortCode);
        if (!cached) {
            await this.redis.set(shortCode, url, this.cacheTtl);
        }
    }
}
