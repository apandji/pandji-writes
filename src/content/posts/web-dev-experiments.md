---
title: web dev experiments
pubDate: 2026-09-14
journal: programming-usable-interfaces
---

# experiment one - coding on a plane, with white noise

I was working on what I imagine would be my portfolio website. I used Cursor, which had autocomplete, which was nice. But, I was fully disconnected from wifi, and coding by hand. I haven't done this in a while. What I ended up playing around with the most if flexboxes. I resonated with the idea of designing in harmony with the grain of the web's materiality, as when I have worked on web projects prior I would force my vision onto the material and have to make an iPhone version, an iPad version - a full screen one - across multiple viewports. 

![image.png](/uploads/web-dev-experiments/image-1.png)
![image.png](/uploads/web-dev-experiments/image-1.png)

# experiment two - with my buddy ai

Next I used AI to teach me concepts. I asked it for an advanced lesson, and it ended up going into an advanced lesson on typography. What I did was...
1) installed a font file, except I did it through npm. I've never done this before. I did this because I found instructions online. I then asked cursor what I did, as I am unfamiliar. we walked through what it means -- how node_modules is like the warehouse and package-lock.json and package.json are like the grocery list. I ended up moving the woff font file to my own fonts file. 
2) I then set up the @font-face as normal. Because it was out of the nom thing I was familiar with doing this
3) we then worked on defining :root, and defined base size. Then we defined tokens working off that base value. This was super helpful as I have been working with rem and em, but I wasn't 100% sure what the diff was. Now I know that rem is root em, and as long as we define a base font-size as the 1 value, then we can use rem to make nice type scales. 

My portfolio feels a bit better.

![image.png](/uploads/web-dev-experiments/image-1.png)
![image.png](/uploads/web-dev-experiments/image-1.png)
![image.png](/uploads/web-dev-experiments/image-1.png)
