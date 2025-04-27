// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
//add it in boilerplate
// Simplify placeholder for small devices
window.addEventListener("resize", () => {
  const inputField = document.querySelector(".searchbar input");
  if (window.innerWidth <= 768) {
    inputField.placeholder = "DreamDwell"; // Shorter placeholder
  } else {
    inputField.placeholder = "Search by title or location"; // Full placeholder
  }
});

// Set initial placeholder based on current screen size
document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.querySelector(".searchbar input");
  if (window.innerWidth <= 768) {
    inputField.placeholder = "DreamDwell"; // Shorter placeholder
  } else {
    inputField.placeholder = "Search by title or location";
  }
});
