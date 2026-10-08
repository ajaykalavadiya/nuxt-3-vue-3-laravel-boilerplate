<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => ucwords(fake()->words(fake()->numberBetween(2, 3), true)),
            'sku' => strtoupper(fake()->unique()->bothify('???-#####')),
            'description' => fake()->optional()->sentence(12),
            'price' => fake()->randomFloat(2, 5, 500),
            'stock' => fake()->numberBetween(0, 250),
            'is_active' => fake()->boolean(80),
        ];
    }
}
