const { useItem } = require('../../utils/itemLogic.js');
const { useWeapon } = require('../../utils/weaponLogic.js');
const { useArmor } = require('../../utils/armorLogic.js');

Page({
  data: {
    player: {
      name: '求生者',
      health: 100,
      attack: 10,
      defense: 0,
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
      { name: '防弹衣', type: 'armor', defense: 5 },
      { name: '急救包', type: 'healing', health: 20 },
    ],
    enemyPool: [
      { name: '敌人1', health: 30, attack: 15, defense: 2 },
      { name: '敌人2', health: 50, attack: 20, defense: 5 },
      { name: '敌人3', health: 100, attack: 25, defense: 10 },
    ],
    optionsVisible: false,
    continueVisible: false,
    intervalId: null,
    gameOver: false,
  },

  // 游戏初始化
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
        message: `你发现了一个${item.name}！`,
        optionsVisible: true,
        continueVisible: false,
      });
    } else {
      const enemy = this.data.enemyPool[Math.floor(Math.random() * this.data.enemyPool.length)];
      this.setData({
        encounter: { type: 'enemy', details: enemy },
        message: `一个${enemy.name}出现了！`,
        optionsVisible: true,
        continueVisible: false,
      });
    }
  },

  chooseOption(event) {
    const option = event.currentTarget.dataset.option;
    const { encounter } = this.data;

    if (!encounter) return;

    if (encounter.type === 'item') {
      if (option === 'accept') {
        this.handleItemPickup(encounter.details);
      } else {
        this.setData({ message: '你忽略了这个物品。' });
      }
    } else if (encounter.type === 'enemy') {
      if (option === 'fight') {
        this.startBattle();
      } else {
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
      const effectMessage = useArmor(player, item.name);
      this.setData({ player, message: effectMessage });
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
      const damageToEnemy = Math.max(player.attack - enemy.defense, 0);
      let remainingDamageToPlayer = Math.max(enemy.attack - player.defense, 0);

      if (player.defense > 0) {
        const absorbed = Math.min(player.defense, remainingDamageToPlayer);
        player.defense -= absorbed;
        remainingDamageToPlayer -= absorbed;
      }

      player.health = Math.max(player.health - remainingDamageToPlayer, 0);
      enemy.health -= damageToEnemy;

      battleLog += `你对${enemy.name}造成了${damageToEnemy}点伤害，${enemy.name}对你造成了${remainingDamageToPlayer}点实际伤害。\n`;

      if (enemy.health <= 0) {
        battleLog += `你击败了${enemy.name}！\n`;
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
