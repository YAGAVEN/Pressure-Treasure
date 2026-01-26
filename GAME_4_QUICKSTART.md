# Game 4 - Quick Start Guide

## 🎯 What is it?
Challenge 4 "Secrets of the Citadel" is now "The Maester's Trial" - an interactive image description game.

## 🎮 How to Play
1. Join a room and wait for the game to start
2. Navigate to Challenge 4
3. Click **"Start Maester's Trial"**
4. You'll see 5 Game of Thrones images
5. Describe each image in the text box
6. Accuracy meter shows how close you are (need 80%+)
7. Click "Next Trial" when you reach 80%+
8. Complete all 5 levels to finish the challenge

## 📝 Example Descriptions
**Level 1 - Jon Snow:**
- Good: "Jon Snow standing alone on a muddy battlefield drawing his sword against a charging cavalry"
- Also works: "Jon Snow battlefield drawing sword cavalry"
- The more accurate, the higher your score!

## 💡 Tips
- Use the **"Show Hint"** button if stuck
- You can rewrite your description to improve accuracy
- Accuracy updates in real-time as you type
- Green fire icon appears when you're ready to proceed

## ⚠️ Image Setup Required
Place these images in `/public/images/`:
- level1_jon.jpg
- level2_dany.jpg  
- level3_throne.jpg
- level4_dragon.jpg
- level5_hall.jpg

See GAME_4_INTEGRATION.md for details on what each image should show.

## 🔧 Files Created
- `/src/components/Game4Challenge.tsx` - Main game component
- `/src/pages/Game4Page.tsx` - Route wrapper
- `/src/data/game4Levels.ts` - Level data

## ✅ Integration Status
- ✅ Component created
- ✅ Route added
- ✅ Button added to PlayerGame
- ✅ Builds successfully
- ✅ Dev server runs
- ⚠️ Images need to be added manually
