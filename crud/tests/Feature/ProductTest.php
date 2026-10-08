<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('lists only the user\'s own products, paginated', function () {
    Product::factory(3)->for($this->user)->create();
    Product::factory(2)->create();

    $this->getJson('/api/products')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('meta.total', 3);
});

it('searches products by name or sku', function () {
    Product::factory()->for($this->user)->create(['name' => 'Blue Widget', 'sku' => 'AAA-1']);
    Product::factory()->for($this->user)->create(['name' => 'Red Gadget', 'sku' => 'BBB-2']);

    $this->getJson('/api/products?search=widget')->assertJsonCount(1, 'data');
    $this->getJson('/api/products?search=BBB')->assertJsonCount(1, 'data');
});

it('creates a product', function () {
    $this->postJson('/api/products', [
        'name' => 'Starter Plan',
        'sku' => 'PLAN-001',
        'price' => 19.99,
        'stock' => 10,
        'is_active' => true,
    ])->assertCreated()->assertJsonPath('data.sku', 'PLAN-001');

    expect($this->user->products()->count())->toBe(1);
});

it('validates product input', function () {
    Product::factory()->create(['sku' => 'TAKEN']);

    $this->postJson('/api/products', ['sku' => 'TAKEN', 'price' => -1])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'sku', 'price', 'stock']);
});

it('shows, updates and deletes an owned product', function () {
    $product = Product::factory()->for($this->user)->create();

    $this->getJson("/api/products/{$product->id}")->assertOk()->assertJsonPath('data.id', $product->id);

    $this->putJson("/api/products/{$product->id}", ['name' => 'Renamed', 'sku' => $product->sku])
        ->assertOk()
        ->assertJsonPath('data.name', 'Renamed');

    $this->deleteJson("/api/products/{$product->id}")->assertNoContent();
    $this->assertModelMissing($product);
});

it('forbids access to another user\'s product', function () {
    $product = Product::factory()->create();

    $this->getJson("/api/products/{$product->id}")->assertForbidden();
    $this->putJson("/api/products/{$product->id}", ['name' => 'x'])->assertForbidden();
    $this->deleteJson("/api/products/{$product->id}")->assertForbidden();
});
