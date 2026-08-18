import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  @Get('emulator.html')
  serveEmulator(@Res() res: Response) {
    try {
      const filePath = join(__dirname, 'public', 'emulator.html');
      const html = readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('Error serving emulator:', error);
      res.status(500).send('Emulator not found');
    }
  }
}
