import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RatingsService } from '../services/ratings.service';
import {
  CreateRatingDto,
  RatingResponseDto,
  DriverRatingDto,
  CommerceRatingDto,
} from '../dto/index';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Rate an order' })
  @ApiCreatedResponse({ type: RatingResponseDto })
  async rateOrder(
    @Request() req: any,
    @Body() dto: CreateRatingDto,
  ): Promise<RatingResponseDto> {
    return this.ratingsService.createRating(req.user.id, dto);
  }

  @Get('drivers/:id')
  @ApiOperation({ summary: 'Get driver rating stats' })
  @ApiOkResponse({ type: DriverRatingDto })
  async getDriverRating(@Param('id') id: string): Promise<DriverRatingDto> {
    return this.ratingsService.getDriverStats(id);
  }

  @Get('drivers/:id/reviews')
  @ApiOperation({ summary: 'Get driver reviews' })
  @ApiOkResponse({ type: [RatingResponseDto] })
  async getDriverReviews(
    @Param('id') id: string,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ): Promise<RatingResponseDto[]> {
    return this.ratingsService.getDriverReviews(id, skip, take);
  }

  @Get('commerces/:id')
  @ApiOperation({ summary: 'Get commerce rating stats' })
  @ApiOkResponse({ type: CommerceRatingDto })
  async getCommerceRating(@Param('id') id: string): Promise<CommerceRatingDto> {
    return this.ratingsService.getCommerceStats(id);
  }

  @Get('commerces/:id/reviews')
  @ApiOperation({ summary: 'Get commerce reviews' })
  @ApiOkResponse({ type: [RatingResponseDto] })
  async getCommerceReviews(
    @Param('id') id: string,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ): Promise<RatingResponseDto[]> {
    return this.ratingsService.getCommerceReviews(id, skip, take);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get rating for an order' })
  @ApiOkResponse({ type: RatingResponseDto })
  async getOrderRating(@Param('orderId') orderId: string): Promise<RatingResponseDto | null> {
    return this.ratingsService.getOrderRating(orderId);
  }
}
