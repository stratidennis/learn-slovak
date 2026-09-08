// unDraw covers (design/illustrations, recoloured to the primary token; copied to /img/undraw at export).
const COVER: Record<string, string> = {
  '0.1': 'ready-set-go_wr4s', '0.2': 'looking-for-answers_5p23', '0.3': 'random-idea_a29k', '0.4': 'personal-notes_xrz8', '0.5': 'arriving_3rs3',
  '1.1': 'arriving_3rs3', '1.2': 'looking-for-answers_5p23', '1.3': 'working-at-home_usrj', '1.4': 'thumbs-up_f300', '1.5': 'currency-conversion_933g',
  '1.6': 'decision-point_yhu3', '1.7': 'navigation_agc7', '1.8': 'organizing-work_gmo9', '1.9': 'thumbs-up_f300', '1.10': 'live-support_9y6n',
  '1.11': 'sweet-home_b054', '1.12': 'team_mmq0', '1.13': 'team_mmq0',
  '2.1': 'vacation-photos_070r', '2.2': 'progress-bar_o44f', '2.3': 'decision-point_yhu3', '2.4': 'navigation_agc7', '2.5': 'mail-sent_dagx',
  '2.6': 'online-connection_ls95', '2.7': 'currency-conversion_933g', '2.8': 'bug-detected_71if', '2.9': 'looking-for-answers_5p23',
  '2.10': 'deploy-globally_2k9s', '2.11': 'team_mmq0', '2.12': 'sweet-home_b054',
}
export const coverFor = (unitId: string): string | null => COVER[unitId] ? `/img/undraw/${COVER[unitId]}.svg` : null
export const DONE_COVER = '/img/undraw/done_erdp.svg'
export const WINNER_COVER = '/img/undraw/winner_x40e.svg'
