'use strict';


/*
    Code to perform the action of drinking at a fountain.  Assumes that
    cursors() has already been called, and that a check has been made that
    the player is actually standing at a live fountain.
*/
function act_drink_fountain() {
  if (rnd(1501) < 2) {
    updateLog(`  Oops! You seem to have caught the dreadful sleep!`);
    beep();
    died(280, false); /* fell into the dreadful sleep */
    return;
  }

  var x = rnd(100);
  if (x < 7) {
    player.HALFDAM += 200 + rnd(200);
    updateLog(`  You feel a sickness coming on`);
  } else if (x < 13)
    quaffpotion(createObject(OPOTION, 23), false); /* see invisible,but don't know the potion */

  else if (x < 45)
    updateLog(`  Nothing seems to have happened`);

  else if (rnd(3) != 2)
    fntchange(1); /*  change char levels upward   */

  else
    fntchange(-1); /*  change char levels downward */

  if (rnd(12) < 3) {
    updateLog(`  The fountains bubbling slowly quiets`);
    setItem(player.x, player.y, createObject(ODEADFOUNTAIN)); /* dead fountain */
    player.level.know[player.x][player.y] = 0;
  }
  return;
}



/*
    Code to perform the action of washing at a fountain.  Assumes that
    cursors() has already been called and that a check has been made that
    the player is actually standing at a live fountain.
*/
function act_wash_fountain() {
  if (rnd(100) < 11) {
    var x = rnd((level << 2) + 2);
    updateLog(`  Oh no!  The water was foul!  You suffer ${x} hit points!`);
    lastnum = 273; /* drank some poisonous water */
    player.losehp(x);
  } else if (rnd(100) < 29) {
    updateLog(`  You got the dirt off!`);
  } else if (rnd(100) < 31) {
    updateLog(`  This water seems to be hard water!  The dirt didn't come off!`);
  } else if (rnd(100) < 34 && !isGenocided(WATERLORD)) {
    createmonster(WATERLORD); /*    make water lord     */
  } else {
    updateLog(`  Nothing seems to have happened`);
  }
  return;
}



/*
    a subroutine to raise or lower character levels
    if x > 0 they are raised   if x < 0 they are lowered
*/
function fntchange(how) {
  //lprc('\n');
  how = how / Math.abs(how);
  switch (rnd(9)) {
    case 1:
      updateLog(`  Your strength`);
      player.setStrength(player.STRENGTH + how);
      fch(how);
      break;
    case 2:
      updateLog(`  Your intelligence`);
      player.setIntelligence(player.INTELLIGENCE + how);
      fch(how);
      break;
    case 3:
      updateLog(`  Your wisdom`);
      player.setWisdom(player.WISDOM + how);
      fch(how);
      break;
    case 4:
      updateLog(`  Your constitution`);
      player.setConstitution(player.CONSTITUTION + how);
      fch(how);
      break;
    case 5:
      updateLog(`  Your dexterity`);
      player.setDexterity(player.DEXTERITY + how);
      fch(how);
      break;
    case 6:
      updateLog(`Your charm`);
      player.setCharisma(player.CHARISMA + how);
      fch(how);
      break;
    case 7:
      var j = rnd(level + 1);
      if (how < 0) {
        updateLog(`  You lose ${j} hit point`);
        exclaim(j);
        player.losemhp(j);
      } else {
        updateLog(`  You gain ${j} hit point`);
        exclaim(j);
        player.raisemhp(j);
      }
      break;

    case 8:
      var j = rnd(level + 1);
      if (how > 0) {
        updateLog(`  You just gained ${j} spell`);
        exclaim(j);
        player.raisemspells(j);
      } else {
        updateLog(`  You just lost ${j} spell`);
        exclaim(j);
        player.losemspells(j);
      }
      break;

    case 9:
      var j = 5 * rnd((level + 1) * (level + 1));
      if (how < 0) {
        updateLog(`  You just lost ${j} experience point`);
        exclaim(j);
        player.loseexperience(j);
      } else {
        updateLog(`  You just gained ${j} experience point`);
        exclaim(j);
        player.raiseexperience(j);
      }
      break;
  }
}



/*
    subroutine to process an up/down of a character attribute for ofountain
*/
function fch(how) {
  if (how < 0) {
    appendLog(` went down by one!`);
  } else {
    appendLog(` went up by one!`);
  }
}



function exclaim(num) {
  if (num > 1) {
    appendLog(`s!`);
  } else {
    appendLog('!');
  }
}



/*
    For command mode.  Perform drinking at a fountain.
*/
function drink_fountain() {
  var item = itemAt(player.x, player.y);
  if (item.matches(ODEADFOUNTAIN)) {
    updateLog(`There is no water to drink!`);
  } else if (!item.matches(OFOUNTAIN)) {
    updateLog(`I see no fountain to drink from here!`);
  } else {
    act_drink_fountain();
  }
  return;
}



/*
    For command mode.  Perform washing (tidying up) at a fountain.
*/
function wash_fountain() {
  var item = itemAt(player.x, player.y);
  if (item.matches(ODEADFOUNTAIN)) {
    updateLog(`There is no water to wash in!`);
  } else if (!item.matches(OFOUNTAIN)) {
    updateLog(`I see no fountain to wash at here!`);
  } else {
    act_wash_fountain();
  }
  return;
}
