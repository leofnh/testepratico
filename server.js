const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'template'));
app.engine('html', require('ejs').renderFile);


function gravarLog(log, arquivo) {

    const caminhoArquivo = path.join(__dirname, 'logs',  arquivo);
    const dataAtual = new Date();

    fs.appendFile(caminhoArquivo, log + ' - ' + dataAtual.toString() +  '\n', (err) => {
        if (err) {
            console.error('Erro ao gravar o log: ', err);
        } else {
            console.log('Log guardado com sucesso!'); 
        }
    })

}

app.post('/deletartel', async (req, res) => {

    const id_tel = req.body.id_tel;
    const log_exclusao = require('fs');
    console.log('Id do telefone: ',id_tel);

    const buscar_tel = await prisma.telefone.findFirst({
        where: {
            id: id_tel,
        }
    });

    if (buscar_tel) {
        
        const telefoneDeletado = buscar_tel.numero;
        const deletarTelefone = await prisma.telefone.delete({
            where: {
                id: id_tel,
            }
        });

        
        const log = `Telefone ${telefoneDeletado} foi deletado.`;
        const arquivo = 'log_deletados.txt';
        gravarLog(log, arquivo);

        data = {
            status: 'Telefone removido com sucesso!',
            classe: 'alert alert-success'
        }

        res.send(data);
    } else {
        data = {
            status : 'Não existe este telefone para ser removido.',
            classe : 'alert alert-danger'
        }

        res.send(data);
    }

})

app.get('/contatos', async (req, res) => {

    console.log('Atualizou sim');
    
    try {
            ''
        const contatosDb = await prisma.contato.findMany();       
        const numerosDb = await prisma.telefone.findMany();
      
        console.log(contatosDb);
        console.log(numerosDb);

        res.render('contatos.html', {contatosDb, numerosDb});

    } catch (error) {
        console.log(error);
    }

})

app.get('/', (req, res) => {
    res.send('olá mundo');
});

app.get('/home/', (req, res) =>{
    a1 = 4 / 3;
    a2 = 3 / 0;
    a3 = 9 / 3;
    console.log(a1);
    console.log(a2);
    console.log(a3);

    res.sendFile(__dirname + '/template/home.html');
})

app.post('/cadastro', async (req, res) => {
    const nome = req.body.nome;
    const numeros = req.body.numero;
    const idade = parseInt(req.body.idade);

    try {
        const ja_existe = await prisma.contato.findFirst({
            where: {
                nome:nome
            },

        })
        if (ja_existe) {
            const id_contato = ja_existe.id;

            for (const numero of numeros) {

                await prisma.telefone.create({
                    data : {
                        numero: numero,
                        idcontato: id_contato
                    }
                });
            }

            dados = {
                status: 'Este contato já existe, foram adicionados novos números de telefone!',
                classe: 'alert alert-success'

            }
            res.send(dados);

        } else {
            const novoContato = await prisma.contato.create({
                data: {
                    nome: nome,
                    idade: idade,
                    telefones: {
                        create: numeros.map(numero => ({
                            numero: numero,
                        })),

                    },
                },
                include: {
                    telefones: true,
                },
            });

            dados = {
                status: 'Contato criado com sucesso!',
                classe: 'alert alert-success',
                nome: nome
            };

            res.send(dados);
        }
    } catch (error){
        console.log(error);
        res.status(500).send('Erro ao conectar com o banco de dados');
    }
})

class BuscarContato {
    constructor(prisma) {
        this.prisma = prisma;
    }

    async buscarPorNome(nome) {
        try {
            const contato = await this.prisma.contato.findFirst({
                where: {
                    nome: nome,
                },
            });
            return contato;
        } catch (error) {
            throw new Error('Contato não encontrado!');
        }
    }

    async buscarPorTelefone(telefone) {

        try {

            const contato_telefone = await prisma.telefone.findFirst({
                where: {
                    numero: telefone,
                },

            });

            if (contato_telefone) {

                const achar_o_nome = await prisma.contato.findFirst({
                    where: {
                        id: contato_telefone.idcontato
                    }
                });

                return achar_o_nome.nome;

            } else {

                return 'falhou';
            }


        } catch (error) {
            console.log(error);
        }
    }

    async buscarTelefones(id) {
        try {

            const telefones = await prisma.telefone.findMany({
                where:{
                    idcontato:id
                }
            });
            let numero_achado;

            if (telefones) {
                numero_achado = telefones.map(telefone => telefone.numero)
            } else {
                numero_achado = 0
            };
            return numero_achado;

        } catch (error) {
            console.log(error);
        }
    }
}
app.post('/deletarcontato', async (req, res)=> {
    const id_contato = req.body.id_contato;


    const contato_existe = await prisma.contato.findFirst({
        where: {
            id: id_contato,
        }
    });
    if (contato_existe) {
         const contatoDeletado = contato_existe.nome;
        const deletar_telefones = await prisma.telefone.deleteMany({
            where: {
                idcontato: id_contato
            }
        });
        
        const deletar_contato = await prisma.contato.deleteMany({
            where: {
                id: id_contato
            }
        });
        const arquivo = 'log_contato_deletado.txt';

        const log = `Contato ${contatoDeletado} foi deletado.`;
        gravarLog(log, arquivo);
        data = {
            status: 'Contato removido com sucesso!',
            classe: 'alert alert-success'
        }

        res.send(data);

    } else {

        data = {
            status: 'Este contato já foi removido!',
            classe: 'alert alert-danger'
        }

        res.send(data);
    }
})

const buscarContatoService = new BuscarContato(prisma);

app.post('/pesquisarcontato', async (req, res) => {
    const nome = req.body.nome;
    const numero_telefone = req.body.pestelefone;

    try {

        contato = await buscarContatoService.buscarPorNome(nome);
        if (contato) {

            const achar_telefones = await buscarContatoService.buscarTelefones(contato.id);

            const data = {
                status: 'Pesquisa encontrada com sucesso!',
                nome: contato.nome,
                classe: 'alert alert-success',
                numero: achar_telefones,
                status_pesquisa: 'sucesso',
                id: contato.id
            };
            res.send(data);

        } else {

            const achar_por_telefone = await buscarContatoService.buscarPorTelefone(numero_telefone);
            console.log(achar_por_telefone);
            if (achar_por_telefone != 'falhou') {              
                const achar_contato = await buscarContatoService.buscarPorNome(achar_por_telefone);

                if (achar_contato) {

                    const achar_telefone = await buscarContatoService.buscarTelefones(achar_contato.id);

                    const data = {
                        status: 'Pesquisa encontrada com sucesso!',
                        nome: achar_contato.nome,
                        classe: 'alert alert-success',
                        numero: achar_telefone,
                        status_pesquisa: 'sucesso',
                        id: achar_contato.id
                    };
                    res.send(data);


                } else {
                    
                    const data = {
                        status: 'Pesquisa não encontrada',
                        classe: 'alert alert-danger'
                    }
                    res.send(data);
                }
            } else {
                const data = {
                    status: 'Pesquisa não encontrada',
                    classe: 'alert alert-danger'
                }
                res.send(data);
            }

        }

    } catch (error) {
        console.log(error);
    }


})

app.listen(3000, () => {
console.log('Servidor rodando na porta 3000');
});