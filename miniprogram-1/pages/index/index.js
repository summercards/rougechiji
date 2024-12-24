Page({
  data: {
    player: {
      name: '求生者',
      health: 100,
      attack: 10,
      defense: 5,
    },
    message: '游戏开始！求生者正在前进...',
    encounter: null,
    itemPool: [
      { name: '弹药', attack: 5 },
      { name: '防弹衣', defense: 5 },
      { name: '绷带', health: 20 },
    ],
    enemyPool: [
      { name: '敌人1', health: 80, attack: 15, defense: 0 },
      { name: '敌人2', health: 80, attack: 20, defense: 0 },
      { name: '敌人3', health: 70, attack: 25, defense: 0 },
    ],
    optionsVisible: false,
    continueVisible: false,
    intervalId: null,
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
    const { encounter, player } = this.data;

    if (!encounter) return;

    if (encounter.type === 'item') {
      if (option === 'accept') {
        const { details: item } = encounter;
        const newPlayer = { ...player };
        if (item.attack) newPlayer.attack += item.attack;
        if (item.defense) newPlayer.defense += item.defense;
        if (item.health) newPlayer.health += item.health;

        this.setData({
          player: newPlayer,
          message: `你获得了${item.name}，属性提升了！`,
        });
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

  startBattle() {
    let { player, encounter } = this.data;
    const enemy = { ...encounter.details };
    let battleLog = '';

    while (player.health > 0 && enemy.health > 0) {
      const damageToEnemy = Math.max(player.attack - enemy.defense, 0);
      const damageToPlayer = Math.max(enemy.attack - player.defense, 0);

      enemy.health -= damageToEnemy;
      player.health -= damageToPlayer;

      battleLog += `你对${enemy.name}造成了${damageToEnemy}点伤害，${enemy.name}对你造成了${damageToPlayer}点伤害。\n`;

      if (enemy.health <= 0) {
        battleLog += `你击败了${enemy.name}！\n`;
      } else if (player.health <= 0) {
        battleLog += `你被${enemy.name}击败了！游戏结束。\n`;
        break;
      }
    }

    this.setData({
      player: { ...player, health: Math.max(player.health, 0) },
      message: battleLog,
      encounter: null,
      optionsVisible: false,
      continueVisible: player.health > 0,
    });
  },

  continueForward() {
    this.setData({
      message: '求生者继续前进...',
      continueVisible: false,
    });

    this.data.intervalId = setTimeout(() => {
      this.triggerEncounter();
    }, 3000);
  },
});
