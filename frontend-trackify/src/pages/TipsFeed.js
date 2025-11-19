import React, { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, IconButton, Box, TextField, Button, Alert } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import API from "../services/api";

/**
 * Simple tips feed: GET /api/tips ; POST /api/tips ; POST /api/tips/:id/like
 */
export default function TipsFeed() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await API.get("http://localhost:5000/api/tips");
      setTips(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handlePost = async () => {
    setError("");
    if (!text.trim()) {
      setError("Tip text cannot be empty.");
      return;
    }
    try {
      await API.post("http://localhost:5000/api/tips", { text: text.trim() });
      setText("");
      fetchTips();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post tip.");
    }
  };

  const handleLike = async (id) => {
    try {
      await API.post(`http://localhost:5000/api/tips/${id}/like`);
      fetchTips();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4">Community Tips</Typography>

      <Box sx={{ mt: 2, mb: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          fullWidth
          label="Share an eco-friendly tip"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="share-tip"
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={handlePost}>Share</Button>
      </Box>

      <Box>
        {loading ? <Typography>Loading...</Typography> : tips.map((t) => (
          <Card sx={{ mb: 2 }} key={t._id}>
            <CardContent>
              <Typography variant="body1">{t.text}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <IconButton aria-label="like" onClick={() => handleLike(t._id)}><FavoriteIcon /></IconButton>
                <Typography variant="caption">{t.likes || 0} likes</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
