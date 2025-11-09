function calcScore(user, challenges) {
  return (user.solved || []).reduce((sum, cid) => {
    const c = challenges.find(ch => ch.id === cid);
    return sum + (c ? c.points : 0);
  }, 0);
}

module.exports = { calcScore };
 