const { EUW,  NA, KR, AMERICAS, ASIA, EUROPE } = require('../config');
const { key } = require('../secretconfig');
const axios = require('axios');

module.exports  = {
    getUnits,
}

function getServer(serverNumber: number) {
    switch(serverNumber) {
        case 0:
            return EUW;
        case 1:
            return NA;
        case 2:
            return KR;
        default:
            return null;
    }
}

function getRegion(serverNumber: number) {
    switch(serverNumber) {
        case 0:
            return EUROPE;
        case 1:
            return AMERICAS;
        case 2:
            return ASIA;
        default:
            return null;
    }
}

async function getUnits(serverNumber: number) {
    const server = getServer(serverNumber);
    const region = getRegion(serverNumber);
    try{
        let response = await axios.get('https://' + server + '/tft/league/v1/challenger?api_key=' + key);
        const challengers = response.data.entries;
        challengers.sort((a: any,b: any) => {
            return b.leaguePoints - a.leaguePoints;
        });
        const units: any = {};
        const totalPlayers = 5;
        let totalMatches = 3;
        const topPlayers = 4;
        for(let p = 0; p < totalPlayers; p++) {
            response = await axios.get('https://' + server + '/tft/summoner/v1/summoners/' + challengers[p].summonerId + '?api_key=' + key);
            const summoner = {...challengers[0], ...response.data};
            response = await axios.get('https://' + region + '/tft/match/v1/matches/by-puuid/' + summoner.puuid + '/ids?api_key=' + key);
            const matches = response.data;
            for(let i = 0; i < totalMatches; i++) {
                response = await axios.get('https://' + region + '/tft/match/v1/matches/' + matches[i] + '?api_key=' + key);
                const players = response.data.info.participants;
                players.sort((a: any,b: any) => {
                    return a.placement - b.placement;
                });
                for(let j = 0; j < topPlayers; j++) {
                    for(let k = 0; k < players[j].units.length; k++) {
                        if(players[j].units[k].items.length >= 2 && (players[j].units[k].tier === 3 || (players[j].units[k].tier === 2 && players[j].units[k].rarity >= 3))) {
                            const unit: string = players[j].units[k].character_id.split('TFT3_')[1];
                            if(!units[unit]) {
                                units[unit] = {win: 0, top: 0};
                            }
                            if(j === 0) {
                                units[unit].win++;
                            }
                            units[unit].top++;
                        }
                    }
                }
            }
        }

        totalMatches = totalMatches*totalPlayers;

        const unitsArray: any = [];

        for(let key in units) {
            units[key].win = (units[key].win/totalMatches*100).toFixed(2) + '%';
            units[key].top = (units[key].top/totalMatches*100).toFixed(2) + '%';
            units[key].unit = key;
            unitsArray.push(units[key]);
        }

        return {
            code: 202,
            data: {units: unitsArray, totalMatches},
        }
    } catch (error) {
        console.log(error.response);
        return {
            code: 400,
            data: 'Error',
        }
    }
}