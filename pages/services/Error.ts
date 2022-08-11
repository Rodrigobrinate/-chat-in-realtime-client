export default function Error(error: any, styles: any){
    if(error){

        error.display = "flex";
        error.classList.remove(styles.none)
        setTimeout(() => {
             error.classList.add(styles.transition)
        error.classList.remove(styles.notransition)
        }, 100);
           
        
        
        
        setTimeout(() => {
            
            error.classList.add(styles.notransition)
            error.classList.remove(styles.transition)
            setTimeout(() => {
                error.classList.add(styles.none)
           }, 1000);
            
        }, 3000);
        }

return 

}
    