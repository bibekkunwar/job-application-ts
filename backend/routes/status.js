const express = require("express");
const router = express.Router({ mergeParams: true });
const supabase = require("../config/supabase");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const { data, error } = await supabase
      .from("application_status")
      .select("*")
      .eq("job_id", jobId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error("something went wrong", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const { round, round_status, notes, date } = req.body;

    const { data, error } = await supabase
      .from("application_status")
      .insert({ job_id: jobId, round, round_status, notes, date })
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { round, round_status, notes, date } = req.body;

    const { data, error } = await supabase
      .from("application_status")
      .update({ round, round_status, notes, date })
      .eq("app_id", id)
      .select();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("application_status")
      .delete()
      .eq("app_id", id);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
