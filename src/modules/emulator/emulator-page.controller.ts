import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class EmulatorPageController {
  @Get('emulator.html')
  serveEmulator(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'emulator.html');
    const html = readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
