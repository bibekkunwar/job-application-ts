const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("job_application")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("something went wrong", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("POST body:", req.body);
    console.log("User:", req.user);
    const {
      company_name,
      role,
      status,
      platform,
      notes,
      job_url,
      date_applied,
    } = req.body;
    const { data, error } = await supabase
      .from("job_application")
      .insert({
        user_id: req.user.id,
        company_name,
        role,
        status,
        platform,
        notes,
        job_url,
        date_applied,
      })
      .select();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("something went wrong", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const job_id = req.params.id;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("job_application")
      .select()
      .eq("job_id", job_id)
      .eq("user_id", user_id);
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("something went wrong", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const job_id = req.params.id;
    const user_id = req.user.id;
    const { company_name, role, status, notes, platform, job_url, date_applied } = req.body;

    const { data, error } = await supabase
      .from("job_application")
      .update({
        company_name,
        role,
        status,
        notes,
        platform,
        job_url,
        date_applied,
        updated_at: new Date().toISOString(),
      })
      .eq("job_id", job_id)
      .eq("user_id", user_id)
      .select();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("something went wrong", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const job_id = req.params.id;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from("job_application")
      .delete()
      .eq("job_id", job_id)
      .eq("user_id", user_id);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("something went wrong", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
