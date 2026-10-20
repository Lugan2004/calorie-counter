import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { estimateCalories } from '../libs/calorieEstimate'
import { useState } from 'react'





export const Route = createFileRoute('/')({ component: Home })


function Home() {

  const [meal, setMeal] = useState('');
  const mutation = useMutation({mutationFn : (mealText : string) => estimateCalories({data :{meal: mealText}}),
    onSuccess: () =>
      setMeal(''),
  });
 
  const handleEmptyMeal = () => {
    if(meal.trim() === ''){
      alert('Please enter a meal');
      return true;
    }
    
    mutation.mutate(meal);
  
  }


  return (
    <div className="p-8">
      <input
      type='text'
      value={meal}
      onChange={(e) => setMeal(e.target.value)}
      placeholder='Enter a meal'
      className='border p-2 rounded w-full mb-4'
      />
      {mutation.isPending ? (
        'Estimating calories...'
      ) : (
        <>
        {mutation.isError ? (
          <div className="text-red-500">Error ; {mutation.error.message}</div>
        ) : null} 

        {mutation.isSuccess ? <div>Estimated calories: {mutation.data.calories}kcal</div> : null}

        <button onClick={()=>{
          handleEmptyMeal();
        }}>
          estimate calories
        </button>
        </>
      )}
      <span>
      </span>
    </div>
  )
}
