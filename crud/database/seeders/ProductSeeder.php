<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::all()->each(function (User $user) {
            // Spread products across the user's categories, leaving a few uncategorised.
            $categoryIds = $user->categories()->pluck('id')->push(null)->all();

            Product::factory(25)
                ->for($user)
                ->state(new Sequence(fn () => ['category_id' => fake()->randomElement($categoryIds)]))
                ->create();
        });
    }
}
