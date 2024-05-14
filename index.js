const express = require("express");
const app = express();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
app.use(express.json());
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//Sirve el archivo index.html

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


//agrega un nuevo roommate
app.post("/roommate", async (req, res) => {
  try {
    const response = await fetch('https://randomuser.me/api');
    const { results } = await response.json();
    const { name } = results[0];
    const apellido = name.last;
    const roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
    
    // Chequea que exista la propiedad 'roommates' en el objeto JSON
    if (!roommatesJSON.roommates) {
      roommatesJSON.roommates = [];
    }

    const nuevoRoommate = { 
      id: uuidv4().slice(0, 6), 
      nombre: `${name.first} ${apellido}`,
      debe: Math.floor(Math.random() * 50 + 1) * 10000,
      recibe: Math.floor(Math.random() * 50 + 1) * 10000
    };
    roommatesJSON.roommates.push(nuevoRoommate);
    fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON, null, 2));
    res.send("Roommate agregado con éxito");
  } catch (error) {
    console.error("Error al agregar roommate:", error);
    res.status(500).send("Error al agregar roommate");
  }
});

//obtiene el roommate

app.get("/roommates", (req, res) => {
  try {
    const data = fs.readFileSync('roommates.json', 'utf8');
    const roommates = JSON.parse(data);
    res.send(roommates);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send("Error reading roommates");
  }
});

// Obtiene los gastos

app.get("/gastos", (req, res) => {
  try {
    const data = fs.readFileSync('gastos.json', 'utf8');
    const gastos = JSON.parse(data);
    const modifiedGastos = gastos.gastos.map(gasto => {
      const { id, descripcion, monto, nombre } = gasto;
      return { id, descripcion, monto, nombre };
    });
    res.send({ gastos: modifiedGastos });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send("Error reading gastos");
  }
});

//Crea un gasto

app.post("/gasto", (req, res) => {
  try {
    const { roommateSelected, descripcion, monto } = req.body;
    console.log("Datos recibidos del cliente:", { roommateSelected, descripcion, monto }); // Agregar este console.log
    const data = fs.readFileSync('gastos.json', 'utf8');
    const gastos = JSON.parse(data);
    const newGasto = {
      id: uuidv4().slice(0, 4),
      nombre: roommateSelected,
      descripcion,
      monto,
    };
    gastos.gastos.push(newGasto);
    fs.writeFileSync('gastos.json', JSON.stringify(gastos));
    res.send("Gasto agregado con éxito");
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send("Error al agregar gasto: " + error.message);
  }
});

//modifica un gasto
app.put("/gasto/:id", (req, res) => {
  const { id } = req.params; 
  const { descripcion, monto } = req.body;
  try {
      const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
      const gastoIndex = gastosJSON.gastos.findIndex(g => g.id === id);
      if (gastoIndex !== -1) {
          gastosJSON.gastos[gastoIndex] = { ...gastosJSON.gastos[gastoIndex], descripcion, monto };
          fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
          res.send("Gasto modificado con éxito");
      } else {
          res.status(404).send("No se encontró el gasto con el ID proporcionado");
      }
  } catch (error) {
      console.error("Error al modificar el gasto:", error);      
  }
});
// Ruta para eliminar un gasto específico.
app.delete("/gasto", (req, res) => {
    const { id } = req.query;
    const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    gastosJSON.gastos = gastosJSON.gastos.filter((g) => g.id !== id);
    fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 2));
    res.send("Gasto eliminado con éxito");
});

