<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Users may only see and change their own products.
     */
    public function view(User $user, Product $product): bool
    {
        return $product->user_id === $user->id;
    }

    public function update(User $user, Product $product): bool
    {
        return $product->user_id === $user->id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $product->user_id === $user->id;
    }
}
