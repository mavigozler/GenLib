"use strict";

document.addEventListener("DOMContentLoaded", () => {
   const checkImagesLoaded = () => {
      const docImages = document.getElementsByTagName("img");
      let allLoaded = true;

      for (let i = 0; i < docImages.length; i++) {
         const img = docImages.item(i);
         if (img && !img.complete) {
            allLoaded = false;
            break;
         }
      }

      if (allLoaded) {
         console.log("All images are fully loaded.");
      } else {
         console.log("Checking images again in 100ms...");
         setTimeout(checkImagesLoaded, 100);
      }
   };
   checkImagesLoaded();
});
