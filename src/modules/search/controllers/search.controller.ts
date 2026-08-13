import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { SearchService } from '../services/search.service';
import {
  SearchQueryDto,
  SearchResultDto,
  ProcessMessageDto,
  SuggestionResponseDto,
} from '../dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search products by query' })
  @ApiOkResponse({ type: [SearchResultDto] })
  async searchProducts(@Body() dto: SearchQueryDto): Promise<SearchResultDto[]> {
    return this.searchService.searchProducts(dto);
  }

  @Post('process-message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process natural language message with AI' })
  async processMessage(@Body() dto: ProcessMessageDto) {
    return this.searchService.processMessage(dto);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiOkResponse({ type: SuggestionResponseDto })
  async getSuggestions(
    @Query('prefix') prefix: string,
    @Query('limit') limit: string = '5',
  ): Promise<SuggestionResponseDto> {
    const suggestions = await this.searchService.getSearchSuggestions(
      prefix,
      parseInt(limit),
    );

    return { suggestions };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular products' })
  @ApiOkResponse({ type: [SearchResultDto] })
  async getPopularProducts(
    @Query('limit') limit: string = '10',
    @Query('municipalityId') municipalityId?: string,
  ): Promise<SearchResultDto[]> {
    return this.searchService.getPopularProducts(municipalityId, parseInt(limit));
  }

  @Get(':productId/related')
  @ApiOperation({ summary: 'Get related products' })
  @ApiOkResponse({ type: [SearchResultDto] })
  async getRelatedProducts(
    @Param('productId') productId: string,
    @Query('limit') limit: string = '5',
  ): Promise<SearchResultDto[]> {
    return this.searchService.getRelatedProducts(productId, parseInt(limit));
  }
}
