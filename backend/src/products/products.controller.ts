import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateProductDto,
  ) {
    const data = await this.productsService.createProduct(req.user.sub, body);
    return { message: 'Product created successfully', data };
  }

  @Get()
  async list(@Query() query: ListProductsDto) {
    const data = await this.productsService.listPublicProducts(query);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  async listMine(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListProductsDto,
  ) {
    const data = await this.productsService.listMyProducts(req.user.sub, query);
    return { data };
  }

  @Get(':id')
  async getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.productsService.getProductById(id);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateProductDto,
  ) {
    const data = await this.productsService.updateProduct(
      req.user.sub,
      id,
      body,
    );
    return { message: 'Product updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteProduct(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.productsService.softDeleteProduct(req.user.sub, id);
    return { message: 'Product deleted successfully' };
  }
}
