import { useState } from "react";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import axios from "axios";

export default function PaymentSetupForm() {
  const [form, setForm] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/billing/setup/", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("Payment method saved!");
    } catch (err) {
      console.error("Payment setup failed", err);
    }
  };

  return (
    <Box p={2}>
      <Paper sx={{ p: 4, maxWidth: 420 }}>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Typography variant="h6">Set Up Payment</Typography>
            <TextField label="Card Number" name="cardNumber" value={form.cardNumber} onChange={handleChange} fullWidth />
            <Stack direction="row" spacing={2}>
              <TextField label="Expiry" name="expiry" value={form.expiry} onChange={handleChange} fullWidth />
              <TextField label="CVC" name="cvc" value={form.cvc} onChange={handleChange} fullWidth />
            </Stack>
            <Button type="submit" variant="contained" fullWidth>
              Save Payment Method
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
