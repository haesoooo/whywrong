import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function correct(){
    const solutions = await prisma.solutions.create({
        data: {
            is_correct : true,
            submission_id : submission.submission_id,
        }
    })

    return solutions
}

async function wrong(){
    const solutions = await prisma.solutions.create({
        data: {
            is_correct : false,
            submission_id : submission.submission_id,
        }
    })

    return solutions
}

export async function POST(request) {

        const { user_id, problem_id, answer } = await request.json();

        const submission = await prisma.submissions.create({
            data: {
                user:{
                    connect : {user_id : user_id},
                },
                problems:{
                    connect : {problem_id : problem_id},
                },
                answer : answer
            }
        })

        const ox_problems = await prisma.ox_problems.findUnique({
            where: {
                problem_id : problem_id,
            },
        })

        const short_answer_problems = await prisma.short_answer_problems.findUnique({
            where: {
                problem_id : problem_id,
            },
        })

        const multiple_choices_problems = await prisma.multiple_choices_problems.findUnique({
            where: {
                problem_id : problem_id,
            },
        })

        if(ox_problems === null && short_answer_problems === null && multiple_choices_problems === null){
            return Response.json({
                status : 'Error',
                message : 'No matching problem found'
            }), {status : 404};
        }
        else if(ox_problems !== null){
            if(ox_problems.correct_answer == answer){
                const solutions = correct();
            }
            else{
                const solutions = wrong();
            }
        }
        else if(short_answer_problems !== null){
            if(short_answer_problems.expected_answer == answer){
                const solutions = correct();
            }
            else{
                const solutions = wrong();
            }
        }
        else if(multiple_choices_problems !== null){
            if(multiple_choices_problems.correct_choice == answer){
                const solutions = correct();
            }
            else{
                const solutions = wrong();
            }
        }

        return Response.json({
           submissionsid: submission.submission_id,
           status : 'Success' 
        });
}

