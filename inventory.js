'use strict';

/* show character's inventory */
function showinventory(select_allowed, callback, inv_filter, show_gold, show_time) {

  nomove = 1;

  mazeMode = false;
  var srcount = 0;

  setCharCallback(callback);

  cursor(1, 1);

  if (show_gold) {
    if (player.GOLD) {
      cltoeoln();
      lprcat(`.) ${Number(player.GOLD).toLocaleString()} gold pieces\n`);
      srcount++;
    } else {
      show_gold = false;
    }
  }

  var widest = 40;
  var wrap = 23;
  wrap -= show_time ? 1 : 0;

  var inventory = player.inventory.slice();
  inventory.sort(inv_sort);

  for (var k = 0; k < inventory.length; k++) {
    var item = inventory[k];
    if (inv_filter(item)) {
      srcount++;
      if (srcount <= wrap) {
        cltoeoln();
        widest = Math.max(widest, item.toString().length + 5);
      } else {
        var extra = show_gold ? 1 : 0;
        cursor(widest, srcount % wrap + extra);
      }
      var foo = player.inventory.indexOf(item);
      lprcat(`${getCharFromIndex(foo)}) ${item}\n`);
    }
  }

  cursor(1, Math.min(wrap + 1, ++srcount));

  if (show_time) {
    cltoeoln();
    lprcat(`Elapsed time is ${elapsedtime()}. You have ${timeleft()} mobuls left\n`);
  }

  cltoeoln();
  more(select_allowed);

  blt();

}



function showall(item) {
  return item != null;
}

function showwield(item) {
  return item && item.isWeapon();
}

function showwear(item) {
  return item && item.isArmor();
}

function showeat(item) {
  return item && item.matches(OCOOKIE);
}

function showread(item) {
  return item && (item.matches(OSCROLL) || item.matches(OBOOK));
}

function showquaff(item) {
  return item && item.matches(OPOTION);
}



const sortorder = [
  OLARNEYE.id,

  OSHIELD.id,
  OLEATHER.id,
  OSTUDLEATHER.id,
  ORING.id,
  OCHAIN.id,
  OSPLINT.id,
  OPLATE.id,
  OPLATEARMOR.id,
  OSSPLATE.id,

  ODAGGER.id,
  OSPEAR.id,
  OFLAIL.id,
  OBATTLEAXE.id,
  OLONGSWORD.id,
  O2SWORD.id,
  OSWORD.id,
  OSWORDofSLASHING.id,
  OHAMMER.id,
  OLANCE.id,

  ORINGOFEXTRA.id,
  OREGENRING.id,
  OPROTRING.id,
  OENERGYRING.id,
  ODEXRING.id,
  OSTRRING.id,
  OCLEVERRING.id,
  ODAMRING.id,

  OBELT.id,

  OSCROLL.id,
  OPOTION.id,
  OBOOK.id,

  OCHEST.id,
  OAMULET.id,
  OORBOFDRAGON.id,
  OSPIRITSCARAB.id,
  OCUBEofUNDEAD.id,
  ONOTHEFT.id,

  OSAPPHIRE.id,
  ORUBY.id,
  OEMERALD.id,
  ODIAMOND.id,

  OCOOKIE.id,
];



function inv_sort(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  var asort = sortorder.indexOf(a.id); // JRP we could cache this in the item object
  var bsort = sortorder.indexOf(b.id); // but it's not enough of a perf issue

  // if the sort order is obvious
  if (asort != bsort) {
    return asort - bsort;
  } else {
    // sort scrolls and potions alphabetically by name, not arg to
    // prevent guessing based on arg (i.e. pulverize/annihilation/lifeprotect would always be last)
    if (a.matches(OSCROLL) && b.matches(OSCROLL) || a.matches(OPOTION) && b.matches(OPOTION)) {
      return a.toString().localeCompare(b.toString());
    } else {
      // otherwise, sort by arg
      return a.arg - b.arg;
    }

  }
}



function parse_inventory(key) {
  nomove = 1;
  if (key == ESC || key == ' ') {
    setMazeMode(true);
    return 1;
  } else {
    return 0;
  }
}



/*
    function to put something in the players inventory
    returns true if success, false if a failure
*/
function take(item) {
  if (item.carry == false) {
    return false;
  }
  var limit = Math.min(15 + (player.LEVEL >> 1), MAXINVEN);
  for (var i = 0; i < limit; i++) {
    if (!player.inventory[i]) {
      player.inventory[i] = item;
      debug(`take(): ` + item);
      limit = 0;
      player.adjustcvalues(item, true);
      if (mazeMode) {
        updateLog(`  You pick up:`);
        updateLog(`${getCharFromIndex(i)}) ${item}`);
      }
      return (true);
    }
  }
  updateLog(`You can't carry anything else`);
  return false;
}



/*
    subroutine to drop an object  returns false if something there already else true
 */
function drop_object(index) {
  dropflag = 1; /* say dropped an item so wont ask to pick it up right away */
  if (index == '*' || index == ' ' || index == 'I') {
    if (mazeMode) {
      showinventory(true, drop_object, showall, false, false);
    } else {
      setMazeMode(true);
    }
    nomove = 1;
    return 0;
  }

  if (index == '.') {
    nomove = 1;
    updateLog(`How much gold will you drop? `);
    setNumberCallback(drop_object_gold, true);
    return 1;
  }

  var useindex = getIndexFromChar(index);
  var item = player.inventory[useindex];

  if (!item) {
    if (useindex >= 0 && useindex < 26) {
      updateLog(`  You don't have item ${index}!`);
    }
    if (useindex <= -1) {
      appendLog(` cancelled`);
      nomove = 1;
    }
    setMazeMode(true);
    return 1;
  }

  if (isItemAt(player.x, player.y)) {
    beep();
    updateLog(`  There's something here already`);
    setMazeMode(true);
    return 1;
  }

  // if (player.y == MAXY - 1 && player.x == 33) return (1); /* not in entrance */

  player.inventory[useindex] = null;
  player.level.items[player.x][player.y] = item;

  updateLog(`  You drop: `);
  updateLog(`${getCharFromIndex(useindex)}) ${item}`);
  // show3(k); /* show what item you dropped*/
  player.level.know[player.x][player.y] = 0;

  if (player.WIELD === item) {
    player.WIELD = null;
  }
  if (player.WEAR === item) {
    player.WEAR = null;
  }
  if (player.SHIELD === item) {
    player.SHIELD = null;
  }
  player.adjustcvalues(item, false);

  setMazeMode(true);
  return 1;
}



function drop_object_gold(amount) {
  dropflag = 1; /* say dropped an item so wont ask to pick it up right away */

  if (amount == ESC) {
    appendLog(` cancelled`);
    nomove = 1;
    return 1;
  }

  if (amount == '*') amount = player.GOLD;

  amount = Number(amount);

  if (amount == 0) return 1;

  if (amount > player.GOLD) {
    updateLog(`  You don't have that much!`);
    return 1;
  }

  if (isItemAt(player.x, player.y)) {
    beep();
    updateLog(`  There's something here already`);
    return 1;
  }

  player.setGold(player.GOLD - amount);
  updateLog(`  You drop ${Number(amount).toLocaleString()} gold pieces`);
  player.level.items[player.x][player.y] = createObject(OGOLDPILE, amount);
  player.level.know[player.x][player.y] = 0;
  return 1;
}



/*
    routine to tell if player can carry one more thing
    returns 1 if pockets are full, else 0
*/
function pocketfull() {
  var limit = Math.min(15 + (player.LEVEL >> 1), MAXINVEN);
  for (var i = 0; i < limit; i++) {
    if (!player.inventory[i]) {
      return (false);
    }
  }
  return (true);
}
