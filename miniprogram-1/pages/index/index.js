const { useItem } = require('../../utils/itemLogic.js');
const { useWeapon } = require('../../utils/weaponLogic.js');
const { useArmor } = require('../../utils/armorLogic.js');

Page({
  data: {
    player: {
      name: '求生者',
      health: 100,
      attack: 10,
      equipment: {
        weapon: null, // 武器栏
        armor: null, // 防弹衣栏
        backpack: Array.from({ length: 25 }, (_, id) => ({
          id,
          name: null, // 初始状态为空
        })),
      },
    },
    message: '游戏开始！求生者正在前进...',
    encounter: null,
    itemPool: [
      { name: '步枪', type: 'weapon', attack: 10 },
      { name: '防弹衣', type: 'armor', defense: 20 },
      { name: '急救包', type: 'healing', health: 20 },
    ],
    enemyPool: [
      { 
        name: '敌人1', 
        health: 30, 
        attack: 15, 
        drops: ['weapon', 'armor', 'healing'] 
      },
      { 
        name: '敌人2', 
        health: 50, 
        attack: 20, 
        drops: ['weapon', 'armor', 'healing'] 
      },
      { 
        name: '敌人3', 
        health: 100, 
        attack: 25, 
        drops: ['weapon', 'armor', 'healing'] 
      },
    ],
    optionsVisible: false,
    continueVisible: false,
    intervalId: null,
    gameOver: false,
  },

  onLoad() {
    this.startFirstEncounter();
  },

  onUnload() {
    clearTimeout(this.data.intervalId);
  },

  startFirstEncounter() {
    this.data.intervalId = setTimeout(() => {
      this.triggerEncounter();
    }, 3000);
  },

  triggerEncounter() {
    const eventType = Math.random() < 0.5 ? 'item' : 'enemy';

    if (eventType === 'item') {
      const item = this.data.itemPool[Math.floor(Math.random() * this.data.itemPool.length)];
      this.setData({
        encounter: { type: 'item', details: item },
        message: `你发现了一个${item.name}，已自动拾取！`,
      });
      this.handleItemPickup(item); // 自动拾取物品
      this.setData({ continueVisible: true }); // 显示继续前进按钮
    } else {
      const enemy = this.data.enemyPool[Math.floor(Math.random() * this.data.enemyPool.length)];
      this.setData({
        encounter: { type: 'enemy', details: enemy },
        message: `一个${enemy.name}出现了！`,
        optionsVisible: true,
      });
    }
  },

  chooseOption(event) {
    const option = event.currentTarget.dataset.option;
    const { encounter } = this.data;

    if (!encounter) return;

    if (encounter.type === 'enemy') {
      if (option === 'fight') {
        this.startBattle();
      } else if (option === 'run') {
        this.setData({ message: '你逃跑了！' });
      }
    }

    this.setData({
      optionsVisible: false,
      continueVisible: true,
    });
  },

  handleItemPickup(item) {
    const { player } = this.data;

    if (item.type === 'weapon') {
      const effectMessage = useWeapon(player, item.name);
      this.setData({ player, message: effectMessage });
    } else if (item.type === 'armor') {
      if (
        !player.equipment.armor || 
        (player.equipment.armor && item.defense > player.equipment.armor.defense)
      ) {
        player.equipment.armor = { name: item.name, defense: item.defense };
        this.setData({ player, message: `你装备了新的防弹衣，数值为${item.defense}！` });
      } else {
        this.setData({
          message: `当前防弹衣的数值更高，未更换防弹衣。`,
        });
      }
    } else {
      this.addItemToBackpack(item);
    }
  },

  addItemToBackpack(item) {
    const { player } = this.data;
    const backpack = player.equipment.backpack;
    const emptySlot = backpack.find(slot => slot.name === null);

    if (emptySlot) {
      emptySlot.name = item.name;
      this.setData({
        player: { ...player, equipment: { ...player.equipment, backpack } },
      });

      this.checkBackpackItems();
    } else {
      this.setData({ message: '背包已满，无法拾取物品。' });
    }
  },

  checkBackpackItems() {
    const { player } = this.data;
    const backpack = player.equipment.backpack;

    backpack.forEach(slot => {
      if (slot.name === '急救包' && player.health < 100) {
        const effectMessage = useItem(player, slot.name);
        if (effectMessage) {
          slot.name = null;
          this.setData({
            player: { ...player, equipment: { ...player.equipment, backpack } },
            message: effectMessage,
          });
        }
      }
    });
  },

  startBattle() {
    let { player, encounter } = this.data;
    const enemy = { ...encounter.details };
    let battleLog = '';

    while (player.health > 0 && enemy.health > 0) {
      const damageToEnemy = Math.max(player.attack, 0);
      let remainingDamageToPlayer = Math.max(enemy.attack, 0);

      if (player.equipment.armor && player.equipment.armor.defense > 0) {
        const armorAbsorb = Math.min(player.equipment.armor.defense, remainingDamageToPlayer);
        player.equipment.armor.defense -= armorAbsorb;
        remainingDamageToPlayer -= armorAbsorb;
      }

      player.health = Math.max(player.health - remainingDamageToPlayer, 0);
      enemy.health -= damageToEnemy;

      battleLog += `你对${enemy.name}造成了${damageToEnemy}点伤害，`;
      battleLog += `敌人对你造成了${remainingDamageToPlayer}点伤害（防弹衣吸收部分已扣除）。\n`;

      if (enemy.health <= 0) {
        battleLog += `你击败了${enemy.name}！\n`;
        this.handleEnemyDrops(enemy); // 掉落物品
      } else if (player.health <= 0) {
        battleLog += `你被${enemy.name}击败了！游戏结束。\n`;
        this.setData({ gameOver: true });
        break;
      }
    }

    this.setData({
      player: { ...player },
      message: battleLog,
      encounter: null,
      optionsVisible: false,
      continueVisible: player.health > 0 && !this.data.gameOver,
    });
  },

  handleEnemyDrops(enemy) {
    const { player, itemPool } = this.data;

    const droppedItems = enemy.drops
      .map(type => itemPool.find(item => item.type === type))
      .filter(item => !!item)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    droppedItems.forEach(item => {
      this.handleItemPickup(item);
    });

    const dropNames = droppedItems.map(item => item.name).join('、');
    this.setData({
      message: `敌人掉落了：${dropNames}，已自动拾取！`,
    });
  },

  continueForward() {
    if (this.data.gameOver) {
      this.setData({
        message: '游戏结束，请重新开始！',
        optionsVisible: false,
        continueVisible: false,
      });
      return;
    }

    this.setData({
      message: '求生者继续前进...',
      continueVisible: false,
    });

    this.data.intervalId = setTimeout(() => {
      this.triggerEncounter();
    }, 3000);
  },

  restartGame() {
    wx.redirectTo({
      url: '/pages/home/home',
    });
  },
});
