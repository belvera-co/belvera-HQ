def calculate_product_cost(recipe_ingredients, ingredient_lookup, packaging_cost=0.35, labor_cost=0.50, servings_per_batch=10):
    ingredient_cost = 0
    for ri in recipe_ingredients:
        ing = ingredient_lookup.get(ri.ingredient_id)
        if ing:
            # cost_per_unit is per kg, quantity_grams -> kg
            ingredient_cost += (ri.quantity_grams / 1000) * ing.cost_per_unit
    
    total_cost = ingredient_cost + packaging_cost + labor_cost
    cost_per_serving = total_cost / servings_per_batch if servings_per_batch else total_cost
    
    # Belvera premium pricing logic
    suggested_retail = round(cost_per_serving * 3.5, 2)  # 3.5x markup for premium
    wholesale = round(cost_per_serving * 2.0, 2)
    margin = round(((suggested_retail - cost_per_serving) / suggested_retail * 100), 2) if suggested_retail else 0

    return {
        "ingredient_cost": round(ingredient_cost, 2),
        "packaging_cost": packaging_cost,
        "labor_cost": labor_cost,
        "total_cost": round(total_cost, 2),
        "cost_per_serving": round(cost_per_serving, 2),
        "suggested_retail": suggested_retail,
        "wholesale_price": wholesale,
        "profit_margin_percent": margin
    }
