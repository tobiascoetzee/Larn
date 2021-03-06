'use strict';


function isKnownPotion(item) {
  if (item.matches(OPOTION)) {
    if (player.knownPotions[item.arg]) {
      return true;
    }
  }
  return false;
}



function learnPotion(item) {
  if (item.matches(OPOTION)) {
    player.knownPotions[item.arg] = item;
  }
}




// TODO  quaffpotion, readscroll, eatcookie are all very similar
function act_quaffpotion(index) {
  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];
  if (item && item.matches(OPOTION)) {
    player.inventory[useindex] = null;
    quaffpotion(item, true);
  } else {
    if (!item) {
      //debug(useindex);
      if (index == '*' || index == ' ' || index == 'I') {
        if (mazeMode) {
          showinventory(true, act_quaffpotion, showquaff, false, false);
        } else {
          setMazeMode(true);
        }
        nomove = 1;
        return 0;
      }

      if (useindex >= 0 && useindex < 26) {
        updateLog(`  You don't have item ${index}!`);
      }
      if (useindex <= -1) {
        appendLog(` cancelled`);
        nomove = 1;
      }
    } else {
      updateLog(`  You can't quaff that!`);
    }
  }
  setMazeMode(true);
  return 1;
}



/*
 * function to drink a potion
 *
 * Also used to perform the action of a potion without quaffing a potion (see
 * invisible capability when drinking from a fountain).
 */
function quaffpotion(potion, set_known) {
  /* check for within bounds */
  if (!potion)
    return;

  /*
   * if player is to know this potion (really quaffing one), make it
   * known
   */
  if (set_known) {
    learnPotion(potion);
  }

  switch (potion.arg) {
    case 0:
      /* sleep */
      updateLog(`  You fall asleep. . .`);
      var sleeplen = rnd(11) - (player.CONSTITUTION >> 2) + 2;
      while (--sleeplen > 0) {
        parse2();
        //nap(1000);
      }
      updateLog(`  You woke up!`);
      break;

    case 1:
      /* healing */
      if (player.HP == player.HPMAX) {
        player.raisemhp(1);
      } else {
        player.raisehp(rnd(20) + 20 + player.LEVEL);
      }
      updateLog(`  You feel better`);
      break;

    case 2:
      /* raise level */
      updateLog(`  Suddenly, you feel much more skillful!`);
      player.raiselevel();
      player.raisemhp(1);
      break;

    case 3:
      /* increase ability */
      switch (rund(6)) {
        case 0:
          player.setStrength(player.STRENGTH + 1);
          break;
        case 1:
          player.setIntelligence(player.INTELLIGENCE + 1);
          break;
        case 2:
          player.setWisdom(player.WISDOM + 1);
          break;
        case 3:
          player.setConstitution(player.CONSTITUTION + 1);
          break;
        case 4:
          player.setDexterity(player.DEXTERITY + 1);
          break;
        case 5:
          player.setCharisma(player.CHARISMA + 1);
          break;
      };
      updateLog(`  You feel strange for a moment`);
      break;

    case 4:
      /* wisdom */
      player.setWisdom(player.WISDOM + rnd(2));
      updateLog(`  You feel more self confident!`);
      break;

    case 5:
      /* strength */
      player.setStrength(Math.max(12, player.STRENGTH + 1));
      updateLog(`  Wow!  You feel great!`);
      break;

    case 6:
      /* charisma */
      player.setCharisma(player.CHARISMA + 1);
      updateLog(`  Your charm went up by one!`);
      break;

    case 7:
      /* dizziness */
      player.setStrength(player.STRENGTH - 1);
      updateLog(`  You become dizzy!`);
      break;

    case 8:
      /* intelligence */
      player.setIntelligence(player.INTELLIGENCE + 1);
      updateLog(`  Your intelligence went up by one!`);
      break;

    case 9:
      /* object detection */
      updateLog(`  You sense the presence of objects!`);
      //nap(1000);
      if (player.BLINDCOUNT > 0)
        return;
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          var item = itemAt(i, j);
          if (item.carry &&
            !item.isGem() &&
            !item.matches(OLARNEYE) &&
            !item.matches(OGOLDPILE)) {
            player.level.know[i][j] = HAVESEEN;
            show1cell(i, j);
          }
        }
      break;

    case 10:
      /* monster detection */
      updateLog(`  You detect the presence of monsters!`);
      //nap(1000);
      if (player.BLINDCOUNT > 0)
        return;
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          var monster = monsterAt(i, j);
          if (monster && (monster.getChar() != OEMPTY.getChar())) {
            player.level.know[i][j] = HAVESEEN;
            show1cell(i, j);
          }
        }
      break;

    case 11:
      /* potion of forgetfulness */
      updateLog(`  You stagger for a moment . .`);
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          player.level.know[i][j] = 0;
          //nap(1000);
        }
      break;

    case 12:
      /* water */
      updateLog(`  This potion has no taste to it`);
      break;

    case 13:
      /* blindness */
      player.BLINDCOUNT += 500;
      updateLog(`  You can't see anything!`);
      break;

    case 14:
      /* confusion */
      player.CONFUSE += 20 + rnd(9);
      updateLog(`  You feel confused`);
      break;

    case 15:
      /* heroism */
      if (player.HERO == 0) {
        player.setStrength(player.STRENGTH + 11);
        player.setIntelligence(player.INTELLIGENCE + 11);
        player.setWisdom(player.WISDOM + 11);
        player.setConstitution(player.CONSTITUTION + 11);
        player.setDexterity(player.DEXTERITY + 11);
        player.setCharisma(player.CHARISMA + 11);
      }
      player.HERO += 250;
      updateLog(`  WOW!!!  You feel Super-fantastic!!!`);
      break;

    case 16:
      /* sturdiness */
      player.setConstitution(player.CONSTITUTION + 1);
      updateLog(`  You have a greater intestinal constitude!`);
      break;

    case 17:
      /* giant strength */
      if (player.GIANTSTR == 0) {
        changedSTR = millis();
      }
      player.updateGiantStr(700);
      updateLog(`  You now have incredibly bulging muscles!!!`);
      break;

    case 18:
      /* fire resistance */
      player.updateFireResistance(1000);
      updateLog(`  You feel a chill run up your spine!`);
      break;

    case 19:
      /* treasure finding */
      updateLog(`  You feel greedy . . .`);
      //nap(1000);
      if (player.BLINDCOUNT > 0)
        return;
      for (var i = 0; i < MAXX; i++)
        for (var j = 0; j < MAXY; j++) {
          var item = itemAt(i, j);
          if (item.isGem() || item.matches(OLARNEYE) || item.matches(OGOLDPILE)) {
            player.level.know[i][j] = HAVESEEN;
            show1cell(i, j);
          }
        }
      break;

    case 20:
      /* instant healing */
      updateLog(`  You feel all better now!`);
      player.raisehp(player.HPMAX - player.HP);
      break;

    case 21:
      /* cure dianthroritis */
      updateLog(`  You don't seem to be affected`);
      break;

    case 22:
      /* poison */
      player.HALFDAM += 200 + rnd(200);
      updateLog(`  You feel a sickness engulf you`);
      break;

    case 23:
      /* see invisible */
      player.SEEINVISIBLE += rnd(1000) + 400;
      monsterlist[STALKER].char = 'I';
      updateLog(`  You feel your vision sharpen`);
      break;
  };
}
