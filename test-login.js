const url = "http://localhost:3000/api/auth/login";
const data = {
  email: "admin@laboratorio.com",
  password: "admin123",
};

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Respuesta del login:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((error) => {
    console.error("❌ Error en el login:", error);
  });
