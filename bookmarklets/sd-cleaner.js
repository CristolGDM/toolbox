trySetup();
var LOADED_KEY = "mik-loaded";
function trySetup() {
	setTimeout(() => {
		//Handle buttons
		const drawers = document.querySelectorAll(".extra-network-subdirs");
		if(!drawers.length) {
			trySetup();
			return;
		}

		drawers.forEach((drawer)=> {
			const buttons = drawer.querySelectorAll(".prose button");
			const folders = {}

			buttons.forEach((button) => {
				const name = button.innerHTML;
				const depth = name.split("/").length -1;
				if(!window[LOADED_KEY]) {
					button.addEventListener("click", () => {
						buttons.forEach((otherbutton) => {otherbutton.style.boxShadow = 'initial'});
						button.style.boxShadow = '0 0 0 2px white';
					})
				}
				if(depth === 0) {
					button.style.background = '#dd5ee2';
					button.style.setProperty('padding-left', '30px', 'important');
					button.style.setProperty('padding-right', '30px', 'important');
					return;
				}
				if(depth === 1) {
					button.style.background = '#009494';
					return;
				}
				const root = name.split("/")[0];
				if(!folders[root]) {
					folders[root] = [];
				}
				folders[root].push(button);
			})
			Object.keys(folders).forEach((folder) => {
				const parent = Array.from(buttons).find((button) => {
					return button.innerHTML.trim() === (folder.trim() + "/");
				})
				const separator = document.createElement("div");
				separator.className = "mik-sep";
				drawer.insertBefore(separator, folders[folder][0]);
				drawer.insertBefore(parent, folders[folder][0]);
				folders[folder].forEach((button) => {
				button.innerHTML = button.innerHTML.replace(folder.trim()+"/", "");})
			})
		})

		//Check missing images
		const missingImages = Array.from(document.querySelector("#txt2img_lora_cards").querySelectorAll(".card")).filter(card => !card.querySelectorAll("img").length);
		if(missingImages?.length) {
			console.log(`Still missing ${missingImages.length} images:`)
			console.log("---------------------------------------------")
			missingImages.forEach((card, index) => {
				console.log(card.getAttribute("data-name"))
			})
		}

		//Clean prompt area
		const textAreasDrawers = ["txt2img_prompt", "txt2img_neg_prompt", "img2img_prompt", "img2img_neg_prompt"];
		const textAreas = textAreasDrawers.map(drawer => document.querySelector("#"+drawer).querySelector("textarea"));
		textAreas.forEach((textArea) => {textArea.setAttribute("rows", 1); textArea.style.height = "unset"});

		//Move styles dropdown up
		document.querySelector("#txt2img_restore_progress").after(document.querySelector("#txt2img_styles_row"));
		document.querySelector("#img2img_restore_progress").after(document.querySelector("#img2img_styles_row"));

		//Add button to footer
		if(!window[LOADED_KEY]){
			const footer = document.querySelector("#footer a").parentElement;
			footer.innerHTML += "\n  • \n";
			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = "srcset-checkbox";
			checkbox.addEventListener('change', function() {
				const images = document.querySelectorAll(".card img");
				images.forEach((image) => {
					if(checkbox.checked) {
						const thumb = image.src;
						if(!thumb) return;

						const altThumb = thumb.replace(".png", "-alt.png");
						image.setAttribute("onerror",`this.srcset='${thumb}';`);
						image.srcset = `${altThumb}`;
					} else {
						image.removeAttribute("srcset");
					}
				})
			});
			footer.appendChild(checkbox);
		}

		window[LOADED_KEY] = true;
		console.log("done");
	}, 1000)
}