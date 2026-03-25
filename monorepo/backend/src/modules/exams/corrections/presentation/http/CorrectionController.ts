import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateCorrection } from '../../application/services/CreateCorrection';
import { GetCorrection } from '../../application/services/GetCorrection';
import { ApplyCorrection } from '../../application/services/ApplyCorrection';
import { CreateCorrectionDto } from './dto/CreateCorrectionDto';

@ApiBearerAuth()
@ApiTags('corrections')
@UseGuards(JwtAuthGuard)
@Controller('corrections')
export class CorrectionController {
  constructor(
    private readonly createCorrection: CreateCorrection,
    private readonly getCorrection: GetCorrection,
    private readonly applyCorrection: ApplyCorrection,
  ) {}

  @Post()
  async create(@Body() dto: CreateCorrectionDto): Promise<unknown> {
    const result = await this.createCorrection.execute(dto);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<unknown> {
    const result = await this.getCorrection.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }

  @Post(':id/apply')
  async apply(@Param('id') id: string): Promise<unknown> {
    const result = await this.applyCorrection.execute({ correctionId: id });
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }
}
