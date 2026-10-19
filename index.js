//external modules
import chalk from 'chalk'
import inquirer from 'inquirer'

//internal modules
import fs from 'fs'

const operation = () => {
    inquirer.prompt([
        {
            type: "rawlist",
            name: "action",
            message: "O que você deseja fazer?",
            choices: [
                "Criar conta",
                "Consultar Saldo",
                "Depositar",
                "Sacar",
                "Sair"
            ]
        }
    ]).then((answer) => {
        const action = answer['action']
        
        if(action == "Criar conta") {
            createAccount()
        } else if (action == "Depositar") {
            makeDeposit()
        } else if (action == "Consultar Saldo") {
            checkBalance()
        } else if (action == "Sacar") {
            withdraw()
        } else {
            console.log(chalk.magenta.italic('Obrigado por usar o Accounts!'))
            process.exit()
        }
    })
    .catch((err) => console.log(err))
}

operation()

//create and account
const createAccount = () => {
    console.log(chalk.bgMagenta.bold('Obrigado por escolher o nosso banco!'))
    console.log(chalk.magenta('Defina as informações da sua conta a seguir'))

    buildAccount()
}

const buildAccount = () => {
     inquirer.prompt([
        {
           name: 'accountName',
           message: "Digite um nome para sua conta"
        },
        {
            name: 'accountNumber',
            message: "Vincule um documente à sua conta"
        }
    ]).then((answer) => {
        const accountName = answer['accountName']
        const accountNumber = answer['accountNumber']

        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if(fs.existsSync(`accounts/${[accountName, accountNumber]}.json`)) {
            console.log(chalk.bgRed('Esta conta já existe. Tente novamente'))
            buildAccount()
        } else {
            fs.writeFileSync(`accounts/${[accountName, accountNumber]}.json`, '{"balance": 0}', 
                (err) => {
                    console.log(err)
                }
            )

            console.log(chalk.bgCyan.bold('Parabéns sua conta foi criada!'))
        }
    })
    .catch((err) => console.log(err))
}

//deposit money to user account
let times = 3

const makeDeposit = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        },
        {
            name: "accountNumber",
            message: "Qual o documento vinculado à conta?"
        }
    ]).then((answer) => {
        times = times - 1

        if(times == 0) {
            console.log(chalk.red.bold('Número de tentativas excedido, tente novamente mais tarde'))
            times = 3
            process.exit()
        } else {
            const accountName = answer['accountName']
            const accountNumber = answer['accountNumber']

            //verify is account exist
            if(!checkAccount(accountName, accountNumber)) {
                return makeDeposit()
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Valor de deposito:'
                }
            ]).then((answer) => {
                const amount = answer['amount']

                //add an amount
                addAmount(accountName, accountNumber, amount)
            }).catch((err) => console.log(err))
        }
    }).catch((err) => console.log(err))
}

//check balance
const checkBalance = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        },
        {
            name: "accountNumber",
            message: "Qual o documento vinculado à conta?"
        }
    ]).then((answer) => {
        times = times - 1

        if(times == 0) {
            console.log(chalk.red.bold('Número de tentativas excedido, tente novamente mais tarde'))
            times = 3
            process.exit()
        } else {
            const accountName = answer['accountName']
            const accountNumber = answer['accountNumber']

            //verify is account exist
            if(!checkAccount(accountName, accountNumber)) {
                return checkBalance()
            } else {
                const accountData = getAccount(accountName, accountNumber)

                console.log(chalk.bgCyan.bold(`O saldo da sua conta é de R$${accountData.balance}`))
            }
        }
    }).catch((err) => console.log(err))
}

//withdraw
const withdraw = () => {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        },
        {
            name: "accountNumber",
            message: "Qual o documento vinculado à conta?"
        }
    ]).then((answer) => {
        times = times - 1

        if(times == 0) {
            console.log(chalk.red.bold('Número de tentativas excedido, tente novamente mais tarde'))
            times = 3
            process.exit()
        } else {
            const accountName = answer['accountName']
            const accountNumber = answer['accountNumber']

            //verify is account exist
            if(!checkAccount(accountName, accountNumber)) {
                return withdraw()
            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Valor de retirada:'
                }
            ]).then((answer) => {
                const amount = answer['amount']

                //get an amount
                getAmount(accountName, accountNumber, amount)
            }).catch((err) => console.log(err))
        }
    }).catch((err) => console.log(err))
}

//check account
const checkAccount = (accountName, accountNumber) => {
    if(!fs.existsSync(`accounts/${[accountName, accountNumber]}.json`)) {
        console.log(chalk.bgRed('Esta conta não existe. Tente novamente'))

        return false
    } else {
        return true
    }
}

//add amount 
const addAmount = (accountName, accountNumber, amount) => {
    const accountData = getAccount(accountName, accountNumber)

    if(!amount) {
        console.log(chalk.bgRed('Ocorreu um erro, tente novamente mais tarde'))
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`accounts/${[accountName, accountNumber]}.json`, JSON.stringify(accountData), (err) => {
        console.log(err)
    })

    console.log(chalk.cyan.bold(`O valor de R$${amount} foi depositado em sua conta!`))
}

//get account
const getAccount = (accountName, accountNumber) => {
    const accountJSON = fs.readFileSync(`accounts/${[accountName, accountNumber]}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

//get amount
const getAmount = (accountName, accountNumber, amount) => {
    const accountData = getAccount(accountName, accountNumber)

    if(!amount) {
        console.log(chalk.bgRed('Ocorreu um erro, tente novamente mais tarde'))
    } else if (amount > accountData.balance) {
        console.log(chalk.red.bold('Saldo insuficiente'))
        return
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts/${[accountName, accountNumber]}.json`, JSON.stringify(accountData), (err) => {
        console.log(err)
    })

    console.log(chalk.cyan.bold(`O valor de R$${amount} foi sacado de sua conta!`))
}