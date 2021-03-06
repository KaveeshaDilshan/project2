const db = require('../config/db');
class QS {
    static async getMaterialValues() {
        console.log("getMaterialValues");
        const query=`SELECT * FROM materialvalue`;
        const out = await db.query(query);
        return out.rows;
    }

    static async getMaterialtoEstimate(material_name,material_amount) {
        console.log("getMaterials");
        const query=`SELECT * FROM materialvalue WHERE m_name=$1 AND m_amount=$2`;
        const out = await db.query(query,[material_name,material_amount]);
        return out.rows;
    }
    
    static async addNewMaterialTodb(m_name, m_amount, m_cost) {
        console.log("getMaterialValues");
        const query=`CALL addMaterialValue($1,$2,$3)`;
        const out = await db.query(query,[m_name, m_amount, m_cost]);
        return out.rows;
    }
    
    static async saveNewEstimateTodb(project_name,estimate_materials) {
        console.log("saveNewEstimateTodb");
        const query1=`select p_id from project where name=$1;`;
        const out1 = await db.query(query1,[project_name]);
        const p_id = out1.rows[0].p_id;
        const out2 = await db.query(`select to_char(current_date :: DATE, 'yyyy-mm-dd');`);
        const today = out2.rows[0].to_char;
        const query3=`INSERT INTO estimate(p_id, create_date,submit_status) VALUES($1,$2,$3) RETURNING e_id;`;
        const out3 = await db.query(query3,[p_id,today,'no']);
        const e_id = out3.rows[0].e_id;

        if(estimate_materials.length>0){
            estimate_materials.forEach(async estimate_material => {
                const query4 = `select m_id from materialvalue where m_name=$1 AND m_amount=$2;`;
                const out4 = await db.query(query4,[estimate_material.material_name,estimate_material.material_amount]);
                const m_id = out4.rows[0].m_id;
                const query5=`INSERT INTO est_mat(e_id, m_id,quantity) VALUES($1,$2,$3);`;
                const out5 = await db.query(query5,[e_id,m_id,estimate_material.material_quantity]);
        })
        }
        return e_id;
    }

    static async getEstimate(e_id) {
        console.log(`getEstimate`);
        const query=`select materialvalue.m_name,materialvalue.m_amount,quantity,m_cost,estimate.p_id from estimate,est_mat,materialvalue where estimate.e_id=est_mat.e_id and est_mat.m_id=materialvalue.m_id and estimate.e_id=$1`;
        const out = await db.query(query,[e_id]);
        return out.rows;
    }
    
    static async sendEstimate(e_id) {
        console.log(`sendEstimate`);
        const out1 = await db.query(`select to_char(current_date :: DATE, 'yyyy-mm-dd');`);
        const today = out1.rows[0].to_char;
        const query2=`update estimate set submit_status=$1, submit_date=$2 where e_id=$3;`;
        const out2 = await db.query(query2,['yes',today,e_id]);
        return out2.rows;
    }

    static async deleteEstimate(e_id) {
        console.log(`deleteEstimate`);
        const query1=`delete from est_mat where e_id=$1;`;
        await db.query(query1,[e_id]);
        const query2=`delete from estimate where e_id=$1;`;
        const out2 = await db.query(query2,[e_id]);
        return out2.rows;
    }
    
    static async getEst_Project(e_id) {
        console.log("getProject");
        const query=`select project.p_id,project.name,project.start_date,estimate.e_id,estimate.submit_status,estimate.create_date,estimate.submit_date from estimate,project where estimate.p_id=project.p_id and estimate.e_id=$1`;
        const out = await db.query(query,[e_id]);
        return out.rows;
    }
    static async getAllProjects() {
        console.log("getProject");
        const query=`select p_id,name,start_date from project;`;
        const out = await db.query(query);
        return out.rows;
    }

    static async ViewProjects(from_date,to_date) {
        console.log("viewProject");
        const query=`select p_id,name,TO_CHAR(start_date :: DATE,'yyyy-mm-dd'),duration from project where start_date between $1 and $2;`;
        const out = await db.query(query,[from_date,to_date]);
        return out.rows;
    }

    static async getProjectIdFromName(name) {
        console.log("getProjectId");
        const query=`SELECT p_id FROM project WHERE name = $1`;
        const out = await db.query(query,[name]);
        return out.rows[0].p_id;
    }

    static async getProjectEstimations(p_id) {
        console.log("estimationsOfProject");
        const query=`SELECT * FROM Estimate where p_id = $1;`;
        const out = await db.query(query,[p_id]);
        return out.rows;
    }

    static async saveNewProjectTodb(project_name,project_startDate, project_duration) {
        console.log("saveNewProjectTodb");
        const allprojects =await this.getAllProjects();
       var similarProject="";
        allprojects.forEach(async project => {
            console.log(project);
            if(project_name==project.name){
                similarProject=1;
            }
        })
        if(similarProject != ""){
            throw ('This project name is alrredy there, please choose an another name.');
        }else{
        const query=`INSERT INTO project(name, start_date, duration) VALUES($1,$2,$3)`;
        const out = await db.query(query,[project_name,project_startDate, project_duration]);
        return out.rows;
        }
    }


}




module.exports = QS;