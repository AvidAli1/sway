import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';

// GET /api/customer/products/categories - Get all categories with product counts
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get categories with product counts
    const categories = await Product.aggregate([
      { 
        $match: { 
          status: 'active',
          inStock: true 
        } 
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          subCategories: { $addToSet: '$subCategory' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          subCategories: {
            $filter: {
              input: '$subCategories',
              cond: { $ne: ['$$this', null] }
            }
          },
          priceRange: {
            min: '$minPrice',
            max: '$maxPrice',
            average: { $round: ['$avgPrice', 2] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get subcategories for each category
    const categoriesWithSubs = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await Product.aggregate([
          { 
            $match: { 
              category: category.name,
              status: 'active',
              inStock: true,
              subCategory: { $ne: null }
            } 
          },
          {
            $group: {
              _id: '$subCategory',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]);

        return {
          ...category,
          subCategories: subCategories.map(sub => ({
            name: sub._id,
            count: sub.count
          }))
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithSubs
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
