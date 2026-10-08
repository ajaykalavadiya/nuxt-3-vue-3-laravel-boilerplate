<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('lists only the user\'s own categories with product counts', function () {
    $category = Category::factory()->for($this->user)->create();
    Product::factory(2)->for($this->user)->for($category)->create();
    Category::factory()->create();

    $this->getJson('/api/categories')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.products_count', 2)
        ->assertJsonPath('meta.total', 1);
});

it('returns the full unpaginated list with all=1', function () {
    Category::factory(12)->for($this->user)->create();

    $this->getJson('/api/categories?all=1')
        ->assertOk()
        ->assertJsonCount(12, 'data')
        ->assertJsonMissingPath('meta');
});

it('creates a category', function () {
    $this->postJson('/api/categories', ['name' => 'Hardware'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Hardware');

    expect($this->user->categories()->count())->toBe(1);
});

it('validates category names are unique per user', function () {
    Category::factory()->for($this->user)->create(['name' => 'Hardware']);
    Category::factory()->create(['name' => 'Software']);

    $this->postJson('/api/categories', ['name' => 'Hardware'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);

    $this->postJson('/api/categories', ['name' => 'Software'])->assertCreated();
});

it('updates and deletes an owned category, uncategorising its products', function () {
    $category = Category::factory()->for($this->user)->create();
    $product = Product::factory()->for($this->user)->for($category)->create();

    $this->putJson("/api/categories/{$category->id}", ['name' => 'Renamed'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Renamed');

    $this->deleteJson("/api/categories/{$category->id}")->assertNoContent();
    $this->assertModelMissing($category);
    expect($product->fresh()->category_id)->toBeNull();
});

it('forbids access to another user\'s category', function () {
    $category = Category::factory()->create();

    $this->getJson("/api/categories/{$category->id}")->assertForbidden();
    $this->putJson("/api/categories/{$category->id}", ['name' => 'x'])->assertForbidden();
    $this->deleteJson("/api/categories/{$category->id}")->assertForbidden();
});

it('assigns a category to a product and filters by it', function () {
    $category = Category::factory()->for($this->user)->create();
    Product::factory()->for($this->user)->create();

    $this->postJson('/api/products', [
        'category_id' => $category->id,
        'name' => 'Laptop',
        'sku' => 'LAP-001',
        'price' => 999,
        'stock' => 3,
    ])->assertCreated()->assertJsonPath('data.category.name', $category->name);

    $this->getJson("/api/products?category_id={$category->id}")
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.sku', 'LAP-001');
});

it('rejects another user\'s category on a product', function () {
    $foreign = Category::factory()->create();

    $this->postJson('/api/products', [
        'category_id' => $foreign->id,
        'name' => 'Laptop',
        'sku' => 'LAP-001',
        'price' => 999,
        'stock' => 3,
    ])->assertUnprocessable()->assertJsonValidationErrors(['category_id']);
});
