// utils/armorLogic.js

const armors = {
  '防弹衣': {
    type: 'armor',
    defense: 5,
    effect: (player) => {
      const defenseBoost = 5;
      player.defense += defenseBoost;
      player.equipment.armor = { name: '防弹衣', defense: defenseBoost };
      return `你装备了防弹衣，防御力提升了${defenseBoost}！`;
    },
  },
};

function useArmor(player, armorName) {
  const armor = armors[armorName];
  if (!armor) return null; // 如果防弹衣不存在
  if (!player.equipment.armor) {
    return armor.effect(player); // 执行防弹衣效果
  }
  return `你已经装备了防弹衣，无法重复装备${armorName}。`;
}

module.exports = {
  useArmor,
};
