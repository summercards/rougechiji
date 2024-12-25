// utils/itemLogic.js
const items = {
  '急救包': {
    type: 'healing',
    condition: (player) => player.health < 100, // 条件：生命值不足 100
    effect: (player) => {
      const healAmount = 20;
      player.health = Math.min(player.health + healAmount, 100);
      return `你自动使用了急救包，恢复了${healAmount}点生命值！`;
    },
  },
  '步枪': {
    type: 'weapon',
    condition: (player) => !player.equipment.weapon, // 条件：未装备武器
    effect: (player) => {
      const attackBoost = 10;
      player.attack += attackBoost;
      player.equipment.weapon = { name: '步枪', attack: attackBoost };
      return `你装备了步枪，攻击力提升了${attackBoost}！`;
    },
  },
  '防弹衣': {
    type: 'armor',
    condition: (player) => !player.equipment.armor, // 条件：未装备防弹衣
    effect: (player) => {
      const defenseBoost = 5;
      player.defense += defenseBoost;
      player.equipment.armor = { name: '防弹衣', defense: defenseBoost };
      return `你装备了防弹衣，防御力提升了${defenseBoost}！`;
    },
  },
};

function useItem(player, itemName) {
  const item = items[itemName];
  if (!item) return null; // 如果道具不存在
  if (item.condition(player)) {
    return item.effect(player); // 执行道具效果
  }
  return null; // 不满足条件时无效果
}

module.exports = {
  useItem,
};
