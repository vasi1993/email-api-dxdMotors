const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/api/send-email", upload.single("image"), async (req, res) => {
  const { nume, email, serie, marca, piese } = req.body;
  const file = req.file;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, // ex: vasymoldovan93@gmail.com
        pass: process.env.MAIL_PASS, // parola aplicație generată în Gmail
      },
    });


  // 1. Trimite mail la DXD MOTORS (la tine)
    await transporter.sendMail({
      from: `"DXD Motors" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "Cerere ofertă piese auto",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
        <div style="text-align: center;">
           <img src="https://i.imgur.com/jnDMyBn.png" alt="DXD Motors Logo" style="width: 200px; margin-bottom: 20px;" />
          <h2 style="color: #003366; margin-bottom: 10px;">Cerere ofertă - DxD Motors</h2>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
          <p><strong style="color: #333;">Nume client:</strong> ${nume}</p>
          <p><strong style="color: #333;">Email:</strong> ${email}</p>
          <p><strong style="color: #333;">Serie Șasiu:</strong> ${serie}</p>
          <p><strong style="color: #333;">Marca / Model / An:</strong> ${marca}</p>
          <p><strong style="color: #333;">Piese cerute:</strong></p>
          <p style="margin-top: -10px; color: #555;">${piese}</p>
          <p style="margin-top: 20px;">📎 Atașament: poza talonului este inclusă în acest email.</p>
        </div>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ccc;" />
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 10px;">
          Acest mesaj a fost generat automat de platforma DxD Motors. Pentru mai multe detalii, vizitează <a href="https://dxdmotors.ro" style="color: #003366;">www.dxdmotors.ro</a>.
        </p>
      </div>
    `,
    
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        },
      ],
    });


        // 2. Trimite confirmare clientului
    await transporter.sendMail({
        from: `"DXD Motors" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Cererea ta a fost primită",
        html: `
          <div style="font-family: Arial; background-color: #f5f7fa; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; border: 1px solid #ddd;">
            <div style="text-align: center;">
              <img src="https://i.imgur.com/jnDMyBn.png" style="width: 180px; margin-bottom: 20px;" />
              <h2 style="color: #003366;">Mulțumim pentru cererea ta!</h2>
            </div>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
              <p>Salut, <strong>${nume}</strong>!</p>
              <p>Am primit cererea ta privind piesele auto și vom reveni cu o ofertă cât mai curând.</p>
              <br/>
              <p>🚗 Cu respect,</p>
              <p><strong>Echipa DXD Motors</strong></p>
            </div>
          </div>
        `,
      });

    // opțional: șterge fișierul după trimitere
    fs.unlinkSync(file.path);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la trimiterea emailului" });
  }
});

app.listen(5000, () => {
  console.log("Server pornit pe http://localhost:5000");
});
