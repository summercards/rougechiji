// utils/weaponLogic.js

const weapons = {
  '步枪': {
    type: 'weapon',
    attack: 10,
    effect: (player) => {
      const attackBoost = 10;
      player.attack += attackBoost;
      player.equipment.weapon = { name: '步枪', attack: attackBoost };
      return `你装备了步枪，攻击力提升了${attackBoost}！`;
    },
  },
};

function useWeapon(player, weaponName) {
  const weapon = weapons[weaponName];
  if (!weapon) return null; // 如果武器不存在
  if (!player.equipment.weapon) {
    return weapon.effect(player); // 执行武器效果
  }
  return `你已经装备了武器，无法重复装备${weaponName}。`;
}

module.exports = {
  useWeapon,
};
