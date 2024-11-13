import { Body, Controller, Get, Post, Param, UsePipes, ValidationPipe, Response, Res, HttpStatus, ResponseDecoratorOptions } from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { createDto } from './dto/Create.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('shortener')
@Controller('shorten')
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiResponse({ status: 201, description: 'The shortened URL is created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createShortLink(@Body() createDto: createDto) {
    return await this.shortenerService.create(createDto);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiParam({ name: 'code', description: 'The short code for the URL' })
  @ApiResponse({ status: 301, description: 'Redirects to the original URL.' })
  @ApiResponse({ status: 404, description: 'Short code not found' })
  async redirect(@Param('code') code: string, @Res() res) {
    const link = await this.shortenerService.getLink(code);
    res.status(HttpStatus.FOUND).setHeader('Location', link);
    res.send();
  }

  @Get('/stats/:code')
  @ApiOperation({ summary: 'Get statistics for a shortened URL' })
  @ApiParam({ name: 'code', description: 'The short code for the URL' })
  @ApiResponse({ status: 200, description: 'Statistics of the shortened URL' })
  @ApiResponse({ status: 404, description: 'Short code not found' })
  async stats(@Param('code') code: string) {
    return await this.shortenerService.getStatistic(code);
  }
}
