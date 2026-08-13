import { Module } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { ClaudeClient } from './claude-client/claude.client';
import { SearchRepository } from './repositories/search.repository';

@Module({
  controllers: [SearchController],
  providers: [SearchService, ClaudeClient, SearchRepository],
  exports: [SearchService],
})
export class SearchModule {}
