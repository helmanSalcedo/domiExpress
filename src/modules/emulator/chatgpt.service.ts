import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface MenuProduct {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

@Injectable()
export class ChatGPTService {
  private apiKey = process.env.CHATGPT_API_KEY || process.env.OPENAI_API_KEY;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  async parseMenuFromImage(imageUrl: string): Promise<MenuProduct[]> {
    if (!this.apiKey) {
      console.warn('⚠️ ChatGPT API key not configured. Using mock products.');
      return this.getMockProducts();
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4-vision',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analiza esta imagen de menú de un restaurante/negocio y extrae TODOS los productos con su nombre, descripción breve y precio.

IMPORTANTE:
- Retorna SOLO JSON válido, sin texto adicional
- Formato exacto: [{"name":"Producto","description":"Breve descripción","price":00000,"category":"Categoría"}]
- Los precios deben estar en pesos colombianos (COP)
- Si no hay precio, estima uno realista para ese tipo de producto en Colombia
- Agrupa por categoría de producto
- Retorna mínimo 3 productos, máximo 20

Responde SOLO con el JSON, nada más.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const products = JSON.parse(content);

      if (!Array.isArray(products)) {
        console.error('❌ Invalid response format from ChatGPT');
        return this.getMockProducts();
      }

      return products.map((p: any) => ({
        name: p.name || 'Producto',
        description: p.description || '',
        price: Number(p.price) || 25000,
        category: p.category || 'General',
      }));
    } catch (error: any) {
      console.error('❌ ChatGPT parsing error:', error.message);
      console.log('📌 Usando productos mock como fallback');
      return this.getMockProducts();
    }
  }

  async parseMenuFromPDF(pdfUrl: string): Promise<MenuProduct[]> {
    if (!this.apiKey) {
      console.warn('⚠️ ChatGPT API key not configured. Using mock products.');
      return this.getMockProducts();
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: `Analiza este menú en PDF (${pdfUrl}) y extrae TODOS los productos con nombre, descripción y precio.

IMPORTANTE:
- Retorna SOLO JSON válido, sin texto adicional
- Formato: [{"name":"Producto","description":"Descripción","price":00000,"category":"Categoría"}]
- Precios en pesos colombianos (COP)
- Mínimo 3, máximo 20 productos

Responde SOLO con JSON.`,
            },
          ],
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const products = JSON.parse(content);

      return Array.isArray(products)
        ? products
        : this.getMockProducts();
    } catch (error: any) {
      console.error('❌ ChatGPT PDF parsing error:', error.message);
      return this.getMockProducts();
    }
  }

  private getMockProducts(): MenuProduct[] {
    return [
      {
        name: 'Hamburguesa Clásica',
        description: 'Carne de res 200g, queso, lechuga, tomate, cebolla',
        price: 25000,
        category: 'Hamburguesas',
      },
      {
        name: 'Pizza Pepperoni',
        description: 'Masa artesanal, salsa de tomate, queso, pepperoni',
        price: 35000,
        category: 'Pizzas',
      },
      {
        name: 'Ensalada Griega',
        description: 'Lechuga, tomate, pepino, queso feta, aceitunas',
        price: 18000,
        category: 'Ensaladas',
      },
      {
        name: 'Pasta Carbonara',
        description: 'Espagueti, huevo, queso parmesano, tocino',
        price: 28000,
        category: 'Pastas',
      },
      {
        name: 'Pollo a la Parrilla',
        description: 'Pechuga de pollo marinada, acompañada con papas y ensalada',
        price: 32000,
        category: 'Platos Principales',
      },
    ];
  }
}
