// Footer year
document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());

// Optional: wedding countdown (set your date/time)
(function(){
  const el = document.getElementById("countdown");
  if(!el) return;
  // Set to your local date/time (YYYY-MM-DDTHH:MM:SS)
  const weddingAt = new Date("2025-12-20T17:00:00"); // ← change this
  function tick(){
    const now = new Date();
    const diff = weddingAt - now;
    if(diff <= 0){ el.textContent = "It's today!"; return; }
    const d = Math.floor(diff/86400000);
    const h = Math.floor(diff%86400000/3600000);
    const m = Math.floor(diff%3600000/60000);
    el.textContent = `${d}d ${h}h ${m}m`;
    requestAnimationFrame(() => setTimeout(tick, 1000));
  }
  tick();
})();

// RSVP form handler
(function(){
  const form = document.getElementById("rsvpForm");
  if(!form) return;

  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const formspreeId =
    (window && window.FORMSPREE_ID) ? window.FORMSPREE_ID : "YOUR_FORM_ID";

  // Simple required fields check
  function validate(){
    let ok = true;
    form.querySelectorAll(".field").forEach(wrapper => {
      const input = wrapper.querySelector("input, select, textarea");
      const error = wrapper.querySelector(".error");
      if(!input) return;
      if(input.hasAttribute("required") && !input.value.trim()){
        error.textContent = "This field is required";
        ok = false;
      } else {
        error.textContent = "";
      }
    });
    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!validate()) { status.textContent = "Please fix the errors above."; return; }

    submitBtn.disabled = true;
    status.textContent = "Sending...";

    try{
      const fd = new FormData(form);
      // Tell Formspree we want JSON response (no redirect)
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: fd,
        headers: { "Accept": "application/json" }
      });

      if(res.ok){
        form.reset();
        status.textContent = "Thank you! Your RSVP has been recorded.";
      } else {
        const data = await res.json().catch(()=>({}));
        const msg = data?.errors?.[0]?.message || "Something went wrong. Please try again.";
        status.textContent = msg;
      }
    } catch(err){
      status.textContent = "Network error. Please try again.";
    } finally{
      submitBtn.disabled = false;
    }
  });
})();
