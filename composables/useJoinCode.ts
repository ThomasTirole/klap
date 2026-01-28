export function generateJoinCode(length = 6) {
    // Alphabet sans caractères ambigus (O/0, I/1, etc.)
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < length; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return code
}
