import { useEffect, useState } from "react";
import "./App.css";

const restaurants = {
  Agadir: ["Classic Burger", "Vegan Burger", "Sweet Potato Fries", "Chicken Wings", "Onion Rings"],
  Giraffe: ["Pad Thai", "Ramen Bowl", "Asian Salad", "Sushi Combo", "Spring Rolls"],
  Zozobra: ["Spicy Noodles", "Chicken Teriyaki", "Miso Soup", "Poke Bowl", "Soba Salad"],
  "Humus Eliau": ["Hummus Masabacha", "Hummus with Egg", "Falafel", "Pita Plate", "Shakshuka"],
  "Pizza Hut": ["Pepperoni Pizza", "Margarita Pizza", "Cheesy Bites", "Garlic Bread", "Coke Bottle"]
};

function App() {
  const [name, setName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [dish, setDish] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!name.trim()) errors.name = "Please enter your name";
    if (!restaurant) errors.restaurant = "Please select a restaurant";
    if (!dish) errors.dish = "Please select a dish";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createOrder = async () => {
    if (!validateForm()) return;

    try {
    setError("");
      const res = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, restaurant, dish }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();
      setOrderId(data.id);
      setStatus("Order created");
    } catch (err) {
      setError("Failed to create order. Please try again.");
    }
  };

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        setError("");
        const res = await fetch(`http://localhost:8000/orders/${orderId}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch order status");
        }

        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        setError("Failed to fetch order status. Please refresh the page.");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="container">
      <h1>🍽️ Order Tracker</h1>

      <div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationErrors.name) {
              setValidationErrors(prev => ({ ...prev, name: "" }));
            }
          }}
        />
        {validationErrors.name && <div className="error">{validationErrors.name}</div>}
      </div>

      <div>
        <select
          value={restaurant}
          onChange={(e) => {
            setRestaurant(e.target.value);
            setDish(""); // reset selected dish when restaurant changes
            if (validationErrors.restaurant) {
              setValidationErrors(prev => ({ ...prev, restaurant: "" }));
            }
          }}
        >
          <option value="">Select Restaurant</option>
          {Object.keys(restaurants).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {validationErrors.restaurant && <div className="error">{validationErrors.restaurant}</div>}
      </div>

      {restaurant && (
        <div>
          <select 
            value={dish} 
            onChange={(e) => {
              setDish(e.target.value);
              if (validationErrors.dish) {
                setValidationErrors(prev => ({ ...prev, dish: "" }));
              }
            }}
          >
            <option value="">Select Dish</option>
            {restaurants[restaurant as keyof typeof restaurants].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {validationErrors.dish && <div className="error">{validationErrors.dish}</div>}
        </div>
      )}

      <button onClick={createOrder}>
        Place Order
      </button>

      {error && <div className="error">{error}</div>}

      {orderId && (
        <div className="status-box">
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Status:</strong> {status}</p>
        </div>
      )}
    </div>
  );
}

export default App;
