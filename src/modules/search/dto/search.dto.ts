import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limit?: number;

  @IsOptional()
  @IsString()
  municipalityId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold?: number; // Similarity threshold 0-100
}

export class SearchResultDto {
  productId!: string;
  productName!: string;
  description?: string;
  price!: number;
  commerce!: {
    id: string;
    name: string;
  };
  similarity!: number;
  imageUrl?: string;
}

export class ProcessMessageDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  municipalityId?: string;
}

export class MessageIntentDto {
  intent!: string;
  entities!: string[];
  confidence!: number;
  query?: string;
}

export class ProductSuggestionDto {
  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  municipalityId?: string;
}

export class SuggestionResponseDto {
  suggestions!: string[];
}
