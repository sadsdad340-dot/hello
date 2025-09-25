class XMLSpriteSheet {
  constructor() {
    this.frames = {};
    this.image = null;
  }

  async loadXML(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    const subTextures = xml.querySelectorAll("SubTexture");

    subTextures.forEach(node => {
      const name = node.getAttribute("name");
      this.frames[name] = {
        x: parseInt(node.getAttribute("x")),
        y: parseInt(node.getAttribute("y")),
        width: parseInt(node.getAttribute("width")),
        height: parseInt(node.getAttribute("height"))
      };
    });
  }

  async loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        resolve();
      };
      img.src = url;
    });
  }

  getFrameCanvas(name) {
    const frame = this.frames[name];
    if (!frame || !this.image) return null;

    const canvas = document.createElement("canvas");
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      this.image,
      frame.x, frame.y, frame.width, frame.height,
      0, 0, frame.width, frame.height
    );
    return canvas;
  }
}

const sheet = new XMLSpriteSheet();

class XMLSpriteExtension {
  getInfo() {
    return {
      id: "xmlsprites",
      name: "XML Sprite Sheets",
      blocks: [
        {
          opcode: "loadAssets",
          blockType: "command",
          text: "load XML [XML] and image [IMG]",
          arguments: {
            XML: { type: "string", defaultValue: "sheet.xml" },
            IMG: { type: "string", defaultValue: "spritesheet.png" }
          }
        },
        {
          opcode: "drawFrame",
          blockType: "command",
          text: "draw frame [NAME] at x: [X] y: [Y]",
          arguments: {
            NAME: { type: "string", defaultValue: "idle" },
            X: { type: "number", defaultValue: 100 },
            Y: { type: "number", defaultValue: 100 }
          }
        }
      ]
    };
  }

  async loadAssets(args) {
    await sheet.loadXML(args.XML);
    await sheet.loadImage(args.IMG);
  }

  drawFrame(args) {
    const canvas = sheet.getFrameCanvas(args.NAME);
    if (!canvas) return;

    const ctx = Scratch.renderer.canvas.getContext("2d");
    ctx.drawImage(canvas, args.X, args.Y);
  }
}

Scratch.extensions.register(new XMLSpriteExtension());
