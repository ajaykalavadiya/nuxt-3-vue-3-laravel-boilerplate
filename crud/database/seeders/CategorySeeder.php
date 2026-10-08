<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $names = ['Electronics', 'Home & Kitchen', 'Office Supplies', 'Software', 'Sports & Outdoors', 'Accessories'];

        User::all()->each(function (User $user) use ($names) {
            foreach ($names as $name) {
                $user->categories()->create(['name' => $name, 'description' => fake()->optional()->sentence(8)]);
            }
        });
    }
}
